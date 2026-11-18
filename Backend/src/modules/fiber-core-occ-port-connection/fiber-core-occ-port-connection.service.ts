import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FiberCoreOccPortConnection } from './entities/fiber-core-occ-port-connection.entity';
import { FiberCoreOccPortConnectionStatus } from './entities/fiber-core-occ-port-connection-status.entity';
import { OccPort } from './entities/occ-port.entity';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { CreateFiberCoreOccPortConnectionDto } from './dto/create-fiber-core-occ-port-connection.dto';
import { Occ } from '../occs/entities/occ.entity';
import { FiberCoreConnectionService } from '../fiber-core-connection/fiber-core-connection.service';

@Injectable()
export class FiberCoreOccPortConnectionService {

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
  ): Promise<FiberCoreOccPortConnectionStatus> {

    const statusRepo = manager.getRepository(FiberCoreOccPortConnectionStatus);

    const status = await statusRepo.findOne({
      where: {
        code,
      },
    });

    if (!status) {
      throw new NotFoundException(
        `Fiber core OCC port connection status "${code}" not found.`,
      );
    }

    return status;
  }



  // ========================================================
  // Helper: increment the portcount
  // ========================================================

  private async incrementOccUsedPortCount(
    occAssetId: string,
    manager: EntityManager,
  ): Promise<void> {

    const occRepository = manager.getRepository(Occ);

    const occ = await occRepository.findOne({
      where: {
        assetId: occAssetId,
      },
    });

    if (!occ) {
      throw new NotFoundException(
        `OCC with Asset ID ${occAssetId} not found.`,
      );
    }

    if (
      occ.portCount !== null &&
      occ.usedPortCount >= occ.portCount
    ) {
      throw new BadRequestException(
        `OCC with Asset ID ${occAssetId} has no available ports.`,
      );
    }

    occ.usedPortCount += 1;

    await occRepository.save(occ);
  }

  // ========================================================
  // Helper: decrement the portcount
  // ========================================================

  private async decrementOccUsedPortCount(
    occAssetId: string,
    manager: EntityManager,
  ): Promise<void> {

    const occRepository = manager.getRepository(Occ);

    const occ = await occRepository.findOne({
      where: {
        assetId: occAssetId,
      },
    });

    if (!occ) {
      throw new NotFoundException(
        `OCC with Asset ID ${occAssetId} not found.`,
      );
    }

    if (occ.usedPortCount <= 0) {
      throw new BadRequestException(
        `OCC with Asset ID ${occAssetId} has an invalid used port count.`,
      );
    }

    occ.usedPortCount -= 1;

    await occRepository.save(occ);
  }

  // ========================================================
  // Create
  // ========================================================

  async create(
    dto: CreateFiberCoreOccPortConnectionDto,
  ): Promise<FiberCoreOccPortConnection> {

    return this.dataSource.transaction(
      async (manager) => {

        const connectionRepo =manager.getRepository(FiberCoreOccPortConnection);

        const fiberCoreRepo =manager.getRepository(FiberCore);

        const occPortRepo =manager.getRepository(OccPort);

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
        // Find OCC Port
        // --------------------------------------------------

        const occPort = await occPortRepo.findOne({
            where: {
              id: dto.occPortId,
            },
            relations: {
              occ: {
                asset: {
                  assetType: true,
                  lifecycleStatus: true,
                  condition: true,
                  site: true,
                },
              },
            },
          });

        if (!occPort) {
          throw new NotFoundException(
            `OCC port with ID ${dto.occPortId} not found.`,
          );
        }

        // --------------------------------------------------
        // Validate OCC
        // --------------------------------------------------

        if (!occPort.occ) {
          throw new BadRequestException(
            `OCC port ${dto.occPortId} is not associated with an OCC.`,
          );
        }

        if (occPort.occ.asset?.assetType?.qualifier.trim().toUpperCase() !== 'OCC') {
          throw new BadRequestException(
            `Asset "${occPort.occ.assetId}" is not an OCC asset.`,
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
        // Get ACTIVE status
        // --------------------------------------------------

        const activeStatus = await this.getStatus(
            'ACTIVE',
            manager,
          );

        // --------------------------------------------------
        // Check OCC Port Availability
        // --------------------------------------------------

        const existingConnection = await connectionRepo.findOne({
            where: {
              occPortId: dto.occPortId,
              statusId: activeStatus.id,
            },
          });

        if (existingConnection) {
          throw new BadRequestException(
            `OCC port ${occPort.portNumber} is already connected.`,
          );
        }

        // --------------------------------------------------
        // Create Connection
        // --------------------------------------------------

        const connection = connectionRepo.create({
            fiberCoreId: dto.fiberCoreId,
            fiberCore,

            fiberCoreSide: dto.fiberCoreSide,

            occPortId: dto.occPortId,
            occPort,

            statusId: activeStatus.id,
            status: activeStatus,
          });

        const savedConnection = await connectionRepo.save(connection);

        // --------------------------------------------------
        // Update OCC used port count
        // --------------------------------------------------

        await this.incrementOccUsedPortCount(occPort.occAssetId, manager);

        // --------------------------------------------------
        // Update Core Status
        // --------------------------------------------------

        await this.fiberCoreConnectionService.updateCoreStatus(dto.fiberCoreId, manager );

        // --------------------------------------------------
        // Return Complete Connection
        // --------------------------------------------------

        const result = await connectionRepo.findOne({
            where: {
              id: savedConnection.id,
            },

            relations: {
              status: true,

              occPort: {
                occ: {
                  asset: {
                    assetType: true,
                    lifecycleStatus: true,
                    condition: true,
                    site: true,
                  },
                },
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
            `Fiber core OCC port connection with ID ${savedConnection.id} not found after creation.`,
          );
        }

        return result;
      },
    );
  }

  // ========================================================
  // Find All
  // ========================================================

  async findAll(): Promise<FiberCoreOccPortConnection[]> {

    return this.dataSource
      .getRepository(FiberCoreOccPortConnection)
      .find({
        relations: {
          status: true,

          occPort: {
            occ: {
              asset: {
                assetType: true,
                lifecycleStatus: true,
                condition: true,
                site: true,
              },
            },
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
  // Find By OCC Port
  // ========================================================

  async findByOccPort(
    occPortId: string,
  ): Promise<FiberCoreOccPortConnection[]> {

    return this.dataSource
      .getRepository(FiberCoreOccPortConnection)
      .find({
        where: {
          occPortId,
        },

        relations: {
          status: true,

          occPort: {
            occ: {
              asset: {
                assetType: true,
                lifecycleStatus: true,
                condition: true,
                site: true,
              },
            },
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
  ): Promise<FiberCoreOccPortConnection> {

    const connection =
      await this.dataSource
        .getRepository(FiberCoreOccPortConnection)
        .findOne({
          where: {
            id,
          },

          relations: {
            status: true,

            occPort: {
              occ: {
                asset: {
                  assetType: true,
                  lifecycleStatus: true,
                  condition: true,
                  site: true,
                },
              },
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
        `Fiber core OCC port connection with ID ${id} not found.`,
      );
    }

    return connection;
  }

  // ========================================================
  // Disconnect
  // ========================================================

  async disconnect(
    id: string,
  ): Promise<FiberCoreOccPortConnection> {

    return this.dataSource.transaction(
      async (manager) => {

        const connectionRepo = manager.getRepository(FiberCoreOccPortConnection);

        const connection = await connectionRepo.findOne({
            where: {
              id,
            },

            relations: {
              status: true,

              fiberCore: {
                status: true,
              },

              occPort: {
                occ: true,
              },
            },
          });

        if (!connection) {
          throw new NotFoundException(
            `Fiber core OCC port connection with ID ${id} not found.`,
          );
        }

        if (connection.status.code !== 'ACTIVE') {
          throw new BadRequestException(
            `Fiber core OCC port connection with ID ${id} is not active.`,
          );
        }

        const disconnectedStatus = await this.getStatus('DISCONNECTED', manager);

        await connectionRepo.update(
          connection.id,
          {
            statusId: disconnectedStatus.id,
          },
        );

        // --------------------------------------------------
        // Update OCC used port count
        // --------------------------------------------------

        await this.decrementOccUsedPortCount(connection.occPort.occAssetId, manager);

        // Recalculate core status

        await this.fiberCoreConnectionService.updateCoreStatus(connection.fiberCoreId, manager);

        return this.findOne(id);
      },
    );
  }
}