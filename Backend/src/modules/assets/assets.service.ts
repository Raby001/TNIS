import { EntityManager, Repository } from "typeorm";
import { Asset } from "./entities/asset.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { AssetType } from "./entities/asset-type.entity";
import { Status } from "./entities/status.entity";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { AssetCodeService } from "./services/asset-code.service";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { toGeometry } from "src/common/mappers/geometry.mapper";
import { Site } from "../sites/entities/site.entity";
import { AssetQueryDto } from "./dto/asset-query.dto";
import { User } from "../users/entities/user.entity";
import { FiberCableConnection } from "../fiber-cable-connections/entities/fiber-cable-connection.entity";

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,

    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,

    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(FiberCableConnection)
    private readonly fiberCableConnectionRepository: Repository<FiberCableConnection>,

    private readonly assetCodeService: AssetCodeService,
  ){}

  // ========================================================
  // Find all Assets with the query
  // ========================================================

  async findAll(query: AssetQueryDto) {
    const {
      search,
      assetTypeId,
      statusId,
      siteId,
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

    if (statusId) {
      queryBuilder.andWhere(
        'asset.status_id = :statusId',
        { statusId },
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
        status: true,
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
    const assetStatusRepo = manager?.getRepository(Status) ?? this.statusRepository;
    const siteRepo = manager?.getRepository(Site) ?? this.siteRepository;
    // ==================================
    // Find site
    // ==================================

    const site = await siteRepo.findOne({
        where: {
          id: dto.siteId,
        },
        relations: {
          city: {
            province: true,
          }
        }
        ,
      });

    if (!site) {
      throw new NotFoundException(
        `Site with ID ${dto.siteId} not found.`,
      );
    }

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
    // Find status of asset
    // ==================================

    const status = await assetStatusRepo.findOne({
      where: {
        id: dto.statusId,
      },
    });

    if (!status) {
      throw new NotFoundException(
        `Status with ID ${dto.statusId} not found.`,
      );
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

    const regionCode = site.city.province.code;


    const code = await this.assetCodeService.generateCode(
        assetType,
        regionCode,
        manager,
      );

    // ==================================
    // Create asset
    // ==================================
    
    const asset = assetRepo.create({
      code,
      name: dto.name,

      siteId: dto.siteId,

      assetTypeId: dto.assetTypeId,
      assetType,
      status,

      assetTag: dto.assetTag,
      serialNumber: dto.serialNumber,
      description: dto.description,

      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,

      installationDate: dto.installationDate ? new Date(dto.installationDate) : null,

      warrantyStart: dto.warrantyStart ? new Date(dto.warrantyStart) : null,

      warrantyEnd: dto.warrantyEnd ? new Date(dto.warrantyEnd): null,

      geometry: dto.geometry ? toGeometry(dto.geometry) : null,

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

    const statusRepo = manager?.getRepository(Status) ?? this.statusRepository;

    // ========================================================
    // check whether the id exit or not
    // ========================================================

    const asset = await assetRepo.findOne({
      where: {
        id,
      },
      relations: {
        assetType: true,
        status: true,
      },
    });

    if (!asset) {
      throw new NotFoundException(
        `Asset with ID ${id} not found.`,
      );
    }

    // ========================================================
    // check whether status is currently asked for changed
    // ========================================================

    if (dto.statusId !== undefined) {

      const status = await statusRepo.findOne({
        where: {
          id: dto.statusId,
        },
      });

      if (!status) {
        throw new NotFoundException(
          `Status with ID ${dto.statusId} not found.`,
        );
      }

      asset.status = status;
      asset.statusId = status.id;
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