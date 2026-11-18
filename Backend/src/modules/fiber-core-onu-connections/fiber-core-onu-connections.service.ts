import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FiberCoreOnuConnection } from './entities/fiber-core-onu-connection.entity';
import { FiberCoreOnuConnectionStatus } from './entities/fiber-core-onu-connection-status.entity';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { Onu } from '../onus/entities/onu.entity';
import { CreateFiberCoreOnuConnectionDto } from './dto/create-fiber-core-onu-connection.dto';
import { FiberCoreConnectionService } from '../fiber-core-connection/fiber-core-connection.service';

@Injectable()
export class FiberCoreOnuConnectionsService {
 constructor(
    private readonly dataSource: DataSource,
    private readonly fiberCoreConnectionService: FiberCoreConnectionService,
  ) {}

  // ========================================================
  // Helper: Get Status
  // ========================================================

  private async getStatus(
    code: string,
    manager: EntityManager,
  ): Promise<FiberCoreOnuConnectionStatus> {

    const statusRepo = manager.getRepository(FiberCoreOnuConnectionStatus);

    const status = await statusRepo.findOne({
      where: {
        code,
      },
    });

    if (!status) {
      throw new NotFoundException(
        `Fiber core ONU connection status "${code}" not found.`,
      );
    }

    return status;
  }


  // ========================================================
  // Create
  // ========================================================

  async create(
    dto: CreateFiberCoreOnuConnectionDto,
  ): Promise<FiberCoreOnuConnection> {

    return this.dataSource.transaction(
      async (manager) => {

        const connectionRepo = manager.getRepository(FiberCoreOnuConnection);

        const fiberCoreRepo = manager.getRepository(FiberCore);

        const onuRepo = manager.getRepository(Onu);

        // --------------------------------------------------
        // Find Fiber Core
        // --------------------------------------------------

        const fiberCore = await fiberCoreRepo.findOne({
            where: {
              id: dto.fiberCoreId,
            },

            relations: {
              fiberCable: {
                asset: true,
              },
              status: true,
            },
          });

        if (!fiberCore) {
          throw new NotFoundException(
            `Fiber Core with ID ${dto.fiberCoreId} not found.`,
          );
        }

        // --------------------------------------------------
        // Find ONU
        // --------------------------------------------------

        const onu = await onuRepo.findOne({
            where: {
              assetId: dto.onuAssetId,
            },

            relations: {
              asset: {
                assetType: true,
              },
              customer: true,
            },
          });

        if (!onu) {
          throw new NotFoundException(
            `ONU with asset ID ${dto.onuAssetId} not found.`,
          );
        }

        // --------------------------------------------------
        // Validate ONU Asset Type
        // --------------------------------------------------

        if (onu.asset?.assetType?.qualifier?.trim().toUpperCase() !== 'ONU') {
          throw new BadRequestException(
            `Asset "${dto.onuAssetId}" is not an ONU asset.`,
          );
        }

        // --------------------------------------------------
        // Validate Core Side
        // --------------------------------------------------

        await this.fiberCoreConnectionService.validateCoreSideAvailable(
          dto.fiberCoreId,
          dto.fiberCoreSide,
          manager,
        );

        // --------------------------------------------------
        // Check ONU already connected
        // --------------------------------------------------

        const activeStatus =  await this.getStatus('ACTIVE', manager);

        const existingOnuConnection = await connectionRepo.findOne({
            where: {
              onuAssetId: dto.onuAssetId,
              statusId: activeStatus.id,
            },
          });

        if (existingOnuConnection) {
          throw new BadRequestException(
            `ONU ${dto.onuAssetId} is already connected to an active fiber core.`,
          );
        }

        // --------------------------------------------------
        // Create Connection
        // --------------------------------------------------

        const connection = connectionRepo.create({
            fiberCoreId: dto.fiberCoreId,
            fiberCore,
            fiberCoreSide: dto.fiberCoreSide,

            onuAssetId: dto.onuAssetId,
            onu,

            statusId: activeStatus.id,
            status: activeStatus,
          });

        const savedConnection = await connectionRepo.save(connection);

        // --------------------------------------------------
        // Update Core Status
        // --------------------------------------------------

        await this.fiberCoreConnectionService.updateCoreStatus(
          dto.fiberCoreId,
          manager,
        );

        // --------------------------------------------------
        // Return Complete Connection
        // --------------------------------------------------

        const result = await connectionRepo.findOne({
            where: {
              id: savedConnection.id,
            },

            relations: {
              status: true,

              onu: {
                asset: {
                  assetType: true,
                  lifecycleStatus: true,
                  condition: true,
                  site: true,
                },
                customer: true,
              },

              fiberCore: {
                fiberCable: {
                  asset: true,
                },
                status: true,
              },
            },
          });

        if (!result) {
          throw new NotFoundException(
            `Fiber core ONU connection with ID ${savedConnection.id} not found after creation.`,
          );
        }

        return result;
      },
    );
  }

  // ========================================================
  // Find All
  // ========================================================

  async findAll(): Promise<FiberCoreOnuConnection[]> {

    return this.dataSource
      .getRepository(FiberCoreOnuConnection)
      .find({
        relations: {
          status: true,

          onu: {
            asset: {
              assetType: true,
              lifecycleStatus: true,
              condition: true,
              site: true,
            },
            customer: true,
          },

          fiberCore: {
            fiberCable: {
              asset: true,
            },
            status: true,
          },
        },

        order: {
          createdAt: 'DESC',
        },
      });
  }

  // ========================================================
  // Find One
  // ========================================================

  async findOne(
    id: string,
  ): Promise<FiberCoreOnuConnection> {

    const connection = await this.dataSource
        .getRepository(FiberCoreOnuConnection)
        .findOne({
          where: {
            id,
          },

          relations: {
            status: true,

            onu: {
              asset: {
                assetType: true,
                lifecycleStatus: true,
                condition: true,
                site: true,
              },
              customer: true,
            },

            fiberCore: {
              fiberCable: {
                asset: true,
              },
              status: true,
            },
          },
        });

    if (!connection) {
      throw new NotFoundException(
        `Fiber core ONU connection with ID ${id} not found.`,
      );
    }

    return connection;
  }

  // ========================================================
  // Disconnect
  // ========================================================

  async disconnect(
    id: string,
  ): Promise<FiberCoreOnuConnection> {

    return this.dataSource.transaction(
      async (manager) => {

        const connectionRepo = manager.getRepository(FiberCoreOnuConnection);

        const connection = await connectionRepo.findOne({
            where: {
              id,
            },

            relations: {
              status: true,
              fiberCore: {
                status: true,
              },
            },
          });

        if (!connection) {
          throw new NotFoundException(
            `Fiber core ONU connection with ID ${id} not found.`,
          );
        }

        if (connection.status.code !== 'ACTIVE') {
          throw new BadRequestException(
            `Fiber core ONU connection with ID ${id} is not active.`,
          );
        }

        const disconnectedStatus = await this.getStatus(
            'DISCONNECTED',
            manager,
          );

        await connectionRepo.update(
          connection.id,
          {
            statusId: disconnectedStatus.id,
          },
        );

        await this.fiberCoreConnectionService.updateCoreStatus(
          connection.fiberCoreId,
          manager,
        );

        return this.findOne(id);
      },
    );
  }
}