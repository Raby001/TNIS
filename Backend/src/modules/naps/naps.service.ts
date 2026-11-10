import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Nap } from './entities/nap.entity';
import { Asset } from '../assets/entities/asset.entity';
import { AssetType } from '../assets/entities/asset-type.entity';
import { CreateNapDto } from './dto/create-nap.dto';
import { UpdateNapDto } from './dto/update-nap.dto';
import { AssetsService } from '../assets/assets.service';
import { OpticalSplitter } from '../optical-splitters/entities/optical-splitter.entity';
import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NapsService {

  constructor(
    @InjectRepository(Nap)
    private readonly napRepository: Repository<Nap>,
    private readonly dataSource: DataSource,
    private readonly assetService: AssetsService,
  ) {}

  // ========================================================
  // Create
  // ========================================================

  async create(
    dto: CreateNapDto,
    userId: string,
  ): Promise<Nap> {
    const nap = await this.dataSource.transaction(
      async (manager) => {
        return this.createInternal(dto, userId, manager);
      },
    );

    return this.findOne(nap.assetId);
  }

  async createInternal(
    dto: CreateNapDto,
    userId: string,
    manager: EntityManager,
  ): Promise<Nap> {

        const napRepo = manager.getRepository(Nap);

        const assetTypeRepo = manager.getRepository(AssetType);

        // Validate Asset Type

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

        if (assetType.qualifier.trim().toUpperCase() !== 'NAP') {
          throw new BadRequestException(
            `Asset type "${assetType.name}" is not a NAP asset type.`,
          );
        }

        // Create Asset through AssetService

        const asset = await this.assetService.createInternal(
            {
              name: dto.name,
              siteId: dto.siteId,
              assetTypeId: dto.assetTypeId,
              manufacturer: dto.manufacturer,
              model: dto.model,
              lifecycleStatusId: dto.lifecycleStatusId,
              conditionId: dto.conditionId,
              description: dto.description,
              geometry: dto.geometry,

              assetTag: dto.assetTag,
              serialNumber: dto.serialNumber,
              purchaseDate: dto.purchaseDate,
              installationDate: dto.installationDate,
              warrantyStart: dto.warrantyStart,
              warrantyEnd: dto.warrantyEnd,
            },
            userId,
            manager,
          );

        // Create NAP

        const nap = napRepo.create({
          assetId: asset.id,
          asset,
          capacity: dto.capacity,
        });

        const savedNap = await napRepo.save(nap);

        // Return complete NAP

        const result = await napRepo.findOne({
            where: {
              assetId: savedNap.assetId,
            },

            relations: {
              asset: {
                assetType: true,
                lifecycleStatus: true,
                condition: true,
              },
            },
          });

        if (!result) {
          throw new NotFoundException(
            `NAP with ID ${savedNap.assetId} not found after creation.`,
          );
        }

        return result;

  }

  // ========================================================
  // Find All
  // ========================================================

  async findAll(): Promise<Nap[]> {

    const napRepo = this.dataSource.getRepository(Nap);
    const opticalSplitterRepo = this.dataSource.getRepository(OpticalSplitter);
    const naps = await napRepo.find({
      relations: {
        asset: {
          assetType: true,
          lifecycleStatus: true,
          condition: true,
        },
      },

      order: {
        assetId: 'ASC',
      },
    });

    return Promise.all(
      naps.map(async (nap) => {

        const splitters = await opticalSplitterRepo.find({
            where: {
              parentAssetId: nap.assetId,
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
          ...nap,
          splitters,
        };
      }),
    );
  }

  // ========================================================
  // Find One
  // ========================================================

  async findOne(id: string) {
    const napRepo = this.dataSource.getRepository(Nap);
    const opticalSplitterRepo = this.dataSource.getRepository(OpticalSplitter);
    const fiberCoreSplitterConnectionRepo = this.dataSource.getRepository(FiberCoreSplitterConnection);

    const nap = await napRepo.findOne({
      where: {
        assetId: id,
      },

      relations: {
        asset: {
          assetType: true,
          lifecycleStatus: true,
          condition: true,
          createdBy: true,
          updatedBy: true,
        },
      },
    });

    if (!nap) {
      throw new NotFoundException(
        `NAP with ID ${id} not found.`,
      );
    }

    const splitters = await opticalSplitterRepo.find({
      where: {
        parentAssetId: nap.assetId,
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
    // Get all active connections for this NAP's splitter ports
    // =======================================================

    const splitterIds = splitters.map(
      (splitter) => splitter.assetId,
    );

    const connections = splitterIds.length > 0
        ? await fiberCoreSplitterConnectionRepo.find({
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
    // Add availability information to every port
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
      ...nap,

      splitters: enrichedSplitters,
    };
  }


  // ========================================================
  // Update
  // ========================================================

  async update(
    id: string,
    dto: UpdateNapDto,
    userId: string,
  ): Promise<Nap> {

    return this.dataSource.transaction(
      async (manager) => {

        const napRepo = manager.getRepository(Nap);

        // Find NAP

        const nap = await napRepo.findOne({
          where: {
            assetId: id,
          },
        });

        if (!nap) {
          throw new NotFoundException(
            `NAP with ID ${id} not found.`,
          );
        }

        // Update Asset through AssetService

        await this.assetService.updateInternal(
          nap.assetId,
          {
            name: dto.name,
            manufacturer: dto.manufacturer,
            model: dto.model,
            lifecycleStatusId: dto.lifecycleStatusId,
            conditionId: dto.conditionId,

            assetTag: dto.assetTag,
            serialNumber: dto.serialNumber,

            description: dto.description,

            geometry: dto.geometry,

            purchaseDate: dto.purchaseDate,
            installationDate: dto.installationDate,
            warrantyStart: dto.warrantyStart,
            warrantyEnd: dto.warrantyEnd,
          },
          userId,
          manager,
        );

        // Update NAP-specific fields

        if (dto.capacity !== undefined && dto.capacity !== nap.capacity) {

          if (dto.capacity < 1) {
            throw new BadRequestException(
              'NAP capacity must be at least 1.',
            );
          }
        }

        // Save NAP

        await napRepo.save(nap);

        // Return complete NAP

        const result = await napRepo.findOne({
            where: {
              assetId: nap.assetId,
            },

            relations: {
              asset: {
                assetType: true,
                lifecycleStatus: true,
                condition: true,
              },
            },
          });

        if (!result) {
          throw new NotFoundException(
            `NAP with ID ${id} not found after update.`,
          );
        }

        return result;
      },
    );
  }
  // ========================================================
  // Delete
  // ========================================================

  async remove(
    assetId: string,
  ): Promise<{ message: string }> {
    const nap = await this.napRepository.findOne({
      where: {
        assetId,
      },
    });

    if (!nap) {
      throw new NotFoundException(
        `NAP with Asset ID ${assetId} not found.`,
      );
    }

    await this.assetService.remove(assetId);

    return {
      message: `Nap with Asset ID ${assetId} deleted successfully.`,
    }
  }
}