import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Lcp } from './entities/lcp.entity';
import { Asset } from '../assets/entities/asset.entity';
import { AssetType } from '../assets/entities/asset-type.entity';
import { OpticalSplitter } from '../optical-splitters/entities/optical-splitter.entity';
import { AssetsService } from '../assets/assets.service';
import { CreateLcpDto } from './dto/create-lcp.dto';
import { UpdateLcpDto } from './dto/update-lcp.dto';
import { DataSource } from 'typeorm';
import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';

@Injectable()
export class LcpsService {
  constructor(
    @InjectRepository(Lcp)
    private readonly lcpRepository: Repository<Lcp>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,

    @InjectRepository(OpticalSplitter)
    private readonly opticalSplitterRepository: Repository<OpticalSplitter>,

    private readonly assetsService: AssetsService,

    private readonly dataSource: DataSource,
  ) {}

  // ========================================================
  // Helper
  // ========================================================

  private async validateLcpAssetType(
    assetTypeId: string,
    manager?: EntityManager,
  ): Promise<AssetType> {
    const assetTypeRepo =
      manager?.getRepository(AssetType) ??
      this.assetTypeRepository;

    const assetType = await assetTypeRepo.findOne({
      where: {
        id: assetTypeId,
      },
    });

    if (!assetType) {
      throw new NotFoundException(
        `Asset type with ID ${assetTypeId} not found.`,
      );
    }

    const qualifier = assetType.qualifier
      ?.trim()
      .toUpperCase();

    if (qualifier !== 'LCP') {
      throw new BadRequestException(
        'The selected asset type must be LCP.',
      );
    }

    return assetType;
  }

  // ========================================================
  // GET ALL
  // ========================================================

  async findAll() {
    const lcps = await this.lcpRepository.find({
      relations: {
        asset: {
          assetType: true,
          lifecycleStatus: true,
          condition: true,
          site: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return Promise.all(
      lcps.map(async (lcp) => {
        const splitters = await this.opticalSplitterRepository.find({
            where: {
              parentAssetId: lcp.assetId,
            },
            relations: {
              splitterRatio: true,
              ports: true,
            },
            order: {
              assetId: 'ASC',
            },
          });

        return {
          ...lcp,
          splitters,
        };
      }),
    );
  }

  // ========================================================
  // GET ONE
  // ========================================================

  async findOne(assetId: string) {
    const lcp = await this.lcpRepository.findOne({
      where: {
        assetId,
      },
      relations: {
        asset: {
          assetType: true,
          lifecycleStatus: true,
          condition: true,
          site: true,
          createdBy: true,
          updatedBy: true,
        },
      },
    });

    if (!lcp) {
      throw new NotFoundException(
        `LCP with Asset ID ${assetId} not found.`,
      );
    }

    const splitters = await this.opticalSplitterRepository.find({
      where: {
        parentAssetId: assetId,
      },
      relations: {
        splitterRatio: true,
        ports: true,
      },
      order: {
        assetId: 'ASC',
      },
    });

    // =======================================================
    // Get all splitter IDs
    // =======================================================

    const splitterIds = splitters.map(
      (splitter) => splitter.assetId,
    );

    // =======================================================
    // Get active fiber-core ↔ splitter-port connections
    // =======================================================

    const connectionRepository = this.dataSource.getRepository(FiberCoreSplitterConnection);

    const connections = splitterIds.length > 0
        ? await connectionRepository.find({
            where: splitterIds.map((splitterId) => ({
              opticalSplitterPort: {
                opticalSplitterId: splitterId,
              },
              status: {
                code: 'ACTIVE',
              },
            })),

            relations: {
              status: true,

              fiberCore: {
                fiberCable: true,
                status: true,
              },

              opticalSplitterPort: true,
            },
          })
        : [];

    // =======================================================
    // Map connection by splitter port ID
    // =======================================================

    const connectionByPortId = new Map(
      connections.map((connection) => [
        connection.opticalSplitterPortId,
        connection,
      ]),
    );

    // =======================================================
    // Add port availability
    // =======================================================

    const enrichedSplitters = splitters.map(
      (splitter) => ({
        ...splitter,

        ports: splitter.ports.map((port) => {
          const connection =
            connectionByPortId.get(port.id);

          if (!connection) {
            return {
              ...port,
              status: 'AVAILABLE',
              connection: null,
            };
          }

          return {
            ...port,

            status: 'USED',

            connection: {
              id: connection.id,

              fiberCoreId: connection.fiberCoreId,

              fiberCoreSide: connection.fiberCoreSide,

              status: connection.status.code,

              fiberCableId: connection.fiberCore.fiberCableId,

              coreNumber: connection.fiberCore.coreNumber,

              fiberCoreStatus: connection.fiberCore.status,
            },
          };
        }),
      }),
    );

    return {
      ...lcp,
      splitters: enrichedSplitters,
    };
  }
  // ========================================================
  // POST
  // ========================================================

  async create(
    dto: CreateLcpDto,
    userId: string,
  ): Promise<Lcp> {
    const result = await this.dataSource.transaction(
      async (manager) => {
        return this.createInternal(
          dto,
          userId,
          manager,
        );
      },
    );

    return this.findOne(result.assetId);
  }

  async createInternal(
    dto: CreateLcpDto,
    userId: string,
    manager: EntityManager,
  ): Promise<Lcp>{

        // 1. Validate Asset Type
        await this.validateLcpAssetType(
          dto.assetTypeId,
          manager,
        );

        // 2. Create common Asset
        const asset = await this.assetsService.createInternal(
            {
              name: dto.name,
              assetTypeId: dto.assetTypeId,
              manufacturer: dto.manufacturer,
              model: dto.model,
              lifecycleStatusId: dto.lifecycleStatusId,
              conditionId: dto.conditionId,
              siteId: dto.siteId,

              assetTag: dto.assetTag,
              serialNumber: dto.serialNumber,
              description: dto.description,

              purchaseDate: dto.purchaseDate,
              installationDate: dto.installationDate,

              warrantyStart: dto.warrantyStart,
              warrantyEnd: dto.warrantyEnd,

              geometry: dto.geometry,
            },
            userId,
            manager,
          );

        // 3. Create LCP-specific record
        const lcp = manager.getRepository(Lcp).create({
          assetId: asset.id,
          asset,

          splitterCapacity: dto.splitterCapacity,
        });

        await manager.getRepository(Lcp).save(lcp);

        // 4. Return complete LCP
        return this.findOneWithinTransaction(
          asset.id,
          manager,
        );

  }

  // ========================================================
  // PATCH
  // ========================================================

  async update(
    assetId: string,
    dto: UpdateLcpDto,
    userId: string,
  ) {
    return this.lcpRepository.manager.transaction(
      async (manager) => {
        const lcpRepo = manager.getRepository(Lcp);

        const lcp = await lcpRepo.findOne({
          where: {
            assetId,
          },
          relations: {
            asset: {
              assetType: true,
            },
          },
        });

        if (!lcp) {
          throw new NotFoundException(
            `LCP with Asset ID ${assetId} not found.`,
          );
        }

        // ================================================
        // Update common Asset
        // ================================================

        const updatedAsset = await this.assetsService.updateInternal(
            assetId,
            {
              name: dto.name,
              manufacturer: dto.manufacturer,
              model: dto.model,
              lifecycleStatusId: dto.lifecycleStatusId,
              conditionId: dto.conditionId,
              assetTag: dto.assetTag,
              serialNumber: dto.serialNumber,
              description: dto.description,

              purchaseDate: dto.purchaseDate,
              installationDate: dto.installationDate,

              warrantyStart: dto.warrantyStart,
              warrantyEnd: dto.warrantyEnd,

              geometry: dto.geometry,
            },
            userId,
            manager,
          );

        // ================================================
        // Update LCP-specific fields
        // ================================================

        if (
          dto.splitterCapacity !== undefined
        ) {
          lcp.splitterCapacity =
            dto.splitterCapacity;
        }

        lcp.asset = updatedAsset;

        await lcpRepo.save(lcp);

        return this.findOneWithinTransaction(
          assetId,
          manager,
        );
      },
    );
  }

  // ========================================================
  // DELETE
  // ========================================================

  async remove(
    assetId: string,
  ) {
    const lcp = await this.lcpRepository.findOne({
      where: {
        assetId,
      },
    });

    if (!lcp) {
      throw new NotFoundException(
        `LCP with Asset ID ${assetId} not found.`,
      );
    }

    await this.assetsService.remove(assetId);

    return {
      message: `LCP with Asset ID ${assetId} deleted successfully.`,
    };
  }

  // ========================================================
  // Internal findOne
  // ========================================================

  private async findOneWithinTransaction(
    assetId: string,
    manager: EntityManager,
  ) {
    const lcpRepo = manager.getRepository(Lcp);
    const splitterRepo = manager.getRepository(OpticalSplitter);

    const lcp = await lcpRepo.findOne({
      where: {
        assetId,
      },
      relations: {
        asset: {
          assetType: true,
          lifecycleStatus: true,
          condition: true,
          site: true,
        },
      },
    });

    if (!lcp) {
      throw new NotFoundException(
        `LCP with Asset ID ${assetId} not found.`,
      );
    }

    const splitters = await splitterRepo.find({
      where: {
        parentAssetId: assetId,
      },
      relations: {
        splitterRatio: true,
        ports: true,
      },
      order: {
        assetId: 'ASC',
      },
    });

    return {
      ...lcp,
      splitters,
    };
  }
}