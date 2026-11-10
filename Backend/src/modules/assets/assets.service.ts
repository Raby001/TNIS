import { EntityManager, Repository } from "typeorm";
import { Asset } from "./entities/asset.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { AssetType } from "./entities/asset-type.entity";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { AssetCodeService } from "./services/asset-code.service";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { toGeometry } from "src/common/mappers/geometry.mapper";
import { AssetQueryDto } from "./dto/asset-query.dto";
import { User } from "../users/entities/user.entity";
import { FiberCableConnection } from "../fiber-cable-connections/entities/fiber-cable-connection.entity";
import { AssetProvinceService } from "./services/asset-province.service";
import { AssetLifecycleStatus } from './entities/asset-lifecycle-status.entity';
import { AssetCondition } from './entities/asset-condition.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly assetCodeService: AssetCodeService,

    private readonly assetProvinceService: AssetProvinceService,

    @InjectRepository(AssetLifecycleStatus)
    private readonly lifecycleStatusRepository: Repository<AssetLifecycleStatus>,

    @InjectRepository(AssetCondition)
    private readonly conditionRepository: Repository<AssetCondition>,

  ){}

  // ========================================================
  // Find all Assets with the query
  // ========================================================

  async findAll(query: AssetQueryDto) {
    const {
      search,
      assetTypeId,
      siteId,
      lifecycleStatusId,
      conditionId,
      createdFrom,
      createdTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.assetType', 'assetType')
      .leftJoinAndSelect('asset.status', 'status')
      .leftJoinAndSelect('asset.lifecycleStatus','lifecycleStatus')
      .leftJoinAndSelect('asset.condition', 'condition')
      .leftJoinAndSelect('asset.site', 'site')
      .leftJoinAndSelect('asset.createdBy', 'createdBy')
      .leftJoinAndSelect('asset.updatedBy', 'updatedBy');
      
    // =========================
    // Search
    // =========================

    if (search) {
      queryBuilder.andWhere(
        `(
          asset.code ILIKE :search
          OR asset.name ILIKE :search
          OR asset.asset_tag ILIKE :search
          OR asset.serial_number ILIKE :search
        )`,
        {
          search: `%${search}%`,
        },
      );
    }

    // =========================
    // Filters
    // =========================

    if (assetTypeId) {
      queryBuilder.andWhere(
        'asset.asset_type_id = :assetTypeId',
        { assetTypeId },
      );
    }

    if (lifecycleStatusId) {
      queryBuilder.andWhere(
        'asset.lifecycle_status_id = :lifecycleStatusId',
        { lifecycleStatusId },
      );
    }

    if (conditionId) {
      queryBuilder.andWhere(
        'asset.condition_id = :conditionId',
        { conditionId },
      );
    }

    if (siteId) {
      queryBuilder.andWhere(
        'asset.site_id = :siteId',
        { siteId },
      );
    }

    // =========================
    // Created date
    // =========================

    if (createdFrom) {
      queryBuilder.andWhere(
        'asset.created_at >= CAST(:createdFrom AS date)',
        {
          createdFrom,
        },
      );
    }

    if (createdTo) {
      queryBuilder.andWhere(
        "asset.created_at < CAST(:createdTo AS date) + INTERVAL '1 day'",
        {
          createdTo,
        },
      );
    }

    // =========================
    // Sorting
    // =========================

    const sortColumnMap = {
      code: 'asset.code',
      name: 'asset.name',
      createdAt: 'asset.created_at',
      updatedAt: 'asset.updated_at',
      purchaseDate: 'asset.purchase_date',
      installationDate: 'asset.installation_date',
    } as const;

    queryBuilder.orderBy(
      sortColumnMap[sortBy],
      sortOrder,
    );

    queryBuilder.addOrderBy(
      'asset.id',
      'ASC',
    );

    // =========================
    // Pagination
    // =========================

    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    // =========================
    // Execute
    // =========================

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ========================================================
  // Find One Assets by Id
  // ========================================================

  async findOne(id: string): Promise<Asset>{
    const asset =  await this.assetRepository.findOne({
      where: {
        id,
      },
      relations: {
        assetType: true,
        lifecycleStatus: true,
        condition: true,
        site: true,
        createdBy: true,
        updatedBy: true,
      },
    })

    if(!asset){
      throw new NotFoundException(`Asset that have id: ${id} is not founded.`)
    }

    return asset;
  }

  // ========================================================
  // Create general asset
  // ========================================================
  
  async create(dto: CreateAssetDto, userId: string,): Promise<Asset> {
    return this.assetRepository.manager.transaction(
      async (manager) => {
        return this.createInternal(dto, userId, manager, );
      }
    )
  }
  // ========================================================
  // create internal for difference type of asset
  // ========================================================
  
  async createInternal(dto: CreateAssetDto, userId?: string, manager?: EntityManager ): Promise<Asset> {

    const assetRepo = manager?.getRepository(Asset) ?? this.assetRepository;
    const assetTypeRepo = manager?.getRepository(AssetType) ?? this.assetTypeRepository;
    const lifecycleStatusRepo = manager?.getRepository(AssetLifecycleStatus) ??this.lifecycleStatusRepository;
    const conditionRepo = manager?.getRepository(AssetCondition) ??this.conditionRepository;

    // ==================================
    // Find asset type
    // ==================================

    const assetType = await assetTypeRepo.findOne({
      where: {
        id: dto.assetTypeId,
      },
    });
    
    if (!assetType) {
      throw new NotFoundException(
        `Asset type with ID ${dto.assetTypeId} not found.`,
      );
    }

    // ==================================
    // Find lifecycle status
    // ==================================

    let lifecycleStatus: AssetLifecycleStatus | null = null;

    if (dto.lifecycleStatusId) {
      lifecycleStatus = await lifecycleStatusRepo.findOne({
        where: {
          id: dto.lifecycleStatusId,
        },
      });

      if (!lifecycleStatus) {
        throw new NotFoundException(
          `Lifecycle status with ID ${dto.lifecycleStatusId} not found.`,
        );
      }
    }

    // ==================================
    // Find asset condition
    // ==================================

    let condition: AssetCondition | null = null;

    if (dto.conditionId) {
      condition = await conditionRepo.findOne({
        where: {
          id: dto.conditionId,
        },
      });

      if (!condition) {
        throw new NotFoundException(
          `Asset condition with ID ${dto.conditionId} not found.`,
        );
      }
    }


    // ==================================
    // Find the user
    // ==================================

    let user: User | null = null;

    if (userId) {
      const userRepo = manager?.getRepository(User) ?? this.userRepository;

      user = await userRepo.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${userId} not found.`,
        );
      }
    }

    // ==================================
    // generate code
    // ==================================

    const assetGeometry = dto.geometry ? toGeometry(dto.geometry): undefined;

    const province = await this.assetProvinceService.resolveProvince(
      dto.siteId,
      assetGeometry,
      manager,
    );

    const code = await this.assetCodeService.generateCode(
      assetType,
      province.code,
      manager,
    );

    // ==================================
    // Create asset
    // ==================================
    
    const asset = assetRepo.create({
      code,
      name: dto.name,

      siteId: dto.siteId ?? null,

      assetTypeId: dto.assetTypeId,
      assetType,

      lifecycleStatusId: lifecycleStatus?.id ?? null,
      lifecycleStatus,

      conditionId: condition?.id ?? null,
      condition,

      assetTag: dto.assetTag,
      serialNumber: dto.serialNumber,
      description: dto.description,
      manufacturer: dto.manufacturer ?? null,
      model: dto.model ?? null,

      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,

      installationDate: dto.installationDate ? new Date(dto.installationDate) : null,

      warrantyStart: dto.warrantyStart ? new Date(dto.warrantyStart) : null,

      warrantyEnd: dto.warrantyEnd ? new Date(dto.warrantyEnd): null,

      geometry: assetGeometry ?? null,

      createdBy: user,

      updatedBy: user,
    });

    try {
      return await assetRepo.save(asset);
    } catch (error: any) {
      if (error?.code === '23505') {
        if (error?.constraint?.includes('serial_number')) {
          throw new ConflictException(
            `Serial number "${dto.serialNumber}" is already in use.`,
          );
        }

        if (error?.constraint?.includes('code')) {
          throw new ConflictException(
            `Asset code "${code}" is already in use.`,
          );
        }

        throw new ConflictException(
          'An asset with the same unique value already exists.',
        );
      }

      throw error;
    }
  }


  // ========================================================
  // Update the internal asset
  // ========================================================
  
  async updateInternal(
    id: string,
    dto: UpdateAssetDto,
    userId: string,
    manager?: EntityManager,
  ): Promise<Asset> {

    const assetRepo = manager?.getRepository(Asset) ?? this.assetRepository;
    const lifecycleStatusRepo = manager?.getRepository(AssetLifecycleStatus) ?? this.lifecycleStatusRepository;
    const conditionRepo = manager?.getRepository(AssetCondition) ?? this.conditionRepository;

    // ========================================================
    // check whether the id exit or not
    // ========================================================

    const asset = await assetRepo.findOne({
      where: {
        id,
      },
      relations: {
        assetType: true,
        lifecycleStatus: true,
        condition: true,
      },
    });

    if (!asset) {
      throw new NotFoundException(
        `Asset with ID ${id} not found.`,
      );
    }

    // ========================================================
    // Update lifecycle status
    // ========================================================

    if (dto.lifecycleStatusId !== undefined) {
      const lifecycleStatus = await lifecycleStatusRepo.findOne({
        where: {
          id: dto.lifecycleStatusId,
        },
      });

      if (!lifecycleStatus) {
        throw new NotFoundException(
          `Lifecycle status with ID ${dto.lifecycleStatusId} not found.`,
        );
      }

      asset.lifecycleStatus = lifecycleStatus;
      asset.lifecycleStatusId = lifecycleStatus.id;
    }

    // ========================================================
    // Update asset condition
    // ========================================================

    if (dto.conditionId !== undefined) {
      const condition = await conditionRepo.findOne({
        where: {
          id: dto.conditionId,
        },
      });

      if (!condition) {
        throw new NotFoundException(
          `Asset condition with ID ${dto.conditionId} not found.`,
        );
      }

      asset.condition = condition;
      asset.conditionId = condition.id;
    }


    if (dto.geometry !== undefined) {
      asset.geometry = dto.geometry ? toGeometry(dto.geometry) : null;
    }

    if (dto.name !== undefined) {
      asset.name = dto.name;
    }

    if (dto.assetTag !== undefined) {
      asset.assetTag = dto.assetTag;
    }

    if (dto.serialNumber !== undefined) {
      asset.serialNumber = dto.serialNumber;
    }

    if (dto.description !== undefined) {
      asset.description = dto.description;
    }

    if (dto.manufacturer !== undefined) {
      asset.manufacturer = dto.manufacturer;
    }

    if (dto.model !== undefined) {
      asset.model = dto.model;
    }

    if (dto.purchaseDate !== undefined) {
      asset.purchaseDate = new Date(dto.purchaseDate);
    }

    if (dto.installationDate !== undefined) {
      asset.installationDate = new Date(dto.installationDate);
    }

    if (dto.warrantyStart !== undefined) {
      asset.warrantyStart = new Date(dto.warrantyStart);
    }

    if (dto.warrantyEnd !== undefined) {
      asset.warrantyEnd = new Date(dto.warrantyEnd);
    }

    if (userId) {
      const userRepo = manager?.getRepository(User) ?? this.userRepository;

      const user = await userRepo.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${userId} not found.`,
        );
      }

      asset.updatedBy = user;
    }

    try {
      return await assetRepo.save(asset);
    } catch (error: any) {
      if (error?.code === '23505') {
        if (error?.constraint?.includes('serial_number')) {
          throw new ConflictException(
            `Serial number "${asset.serialNumber}" is already in use.`,
          );
        }

        if (error?.constraint?.includes('code')) {
          throw new ConflictException(
            `Asset code "${asset.code}" is already in use.`,
          );
        }

        throw new ConflictException(
          'An asset with the same unique value already exists.',
        );
      }

      throw error;
    }
  }

  async update( id: string, dto: UpdateAssetDto, userId: string): Promise<Asset> {

    return this.assetRepository.manager.transaction(
      async (manager) => {
        return this.updateInternal(
          id, dto, userId, manager,
        )
      }
    );
  }


  async remove(id: string): Promise<{ message: string }> {
    return this.assetRepository.manager.transaction(async (manager) => {
      const assetRepository = manager.getRepository(Asset);
      const connectionRepository = manager.getRepository(FiberCableConnection);

      const asset = await assetRepository.findOne({
        where: { id },
      });

      if (!asset) {
        throw new NotFoundException(
          `Asset with ID ${id} not found.`,
        );
      }

      const connections = await connectionRepository.find({
        where: { assetId: id },
        relations: {
          fiberCable: {
            asset: true,
          },
        },
      });

      if (connections.length > 0) {
        const cableIds = [
          ...new Set(connections.map((connection) => connection.fiberCableId)),
        ];

        throw new ConflictException({
          statusCode: 409,
          message: 'Cannot delete this asset because it is used by one or more fiber cable connections.',
          assetId: id,
          fiberCableIds: cableIds,
        });
      }

      await assetRepository.delete(id);

      return {
        message: 'Asset deleted successfully.',
      };
    });
  }

}