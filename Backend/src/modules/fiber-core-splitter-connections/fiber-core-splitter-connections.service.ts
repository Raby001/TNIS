import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FiberCoreSplitterConnection } from './entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from './entities/fiber-core-splitter-connection-status.entity';
import { OpticalSplitterPort, OpticalSplitterPortType } from '../optical-splitters/entities/optical-splitter-port.entity';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { CreateFiberCoreSplitterConnectionDto } from './dto/create-fiber-core-splitter-connection.dto';
import { FiberCoreConnectionService } from '../fiber-core-connection/fiber-core-connection.service';

@Injectable()
export class FiberCoreSplitterConnectionsService {

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
  ): Promise<FiberCoreSplitterConnectionStatus> {

    const statusRepo = manager.getRepository(
        FiberCoreSplitterConnectionStatus,
      );

    const status = await statusRepo.findOne({
      where: {
        code,
      },
    });

    if (!status) {
      throw new NotFoundException(
        `Fiber core splitter connection status "${code}" not found.`,
      );
    }

    return status;
  }


  // ========================================================
  // Create
  // ========================================================

  async create(
    dto: CreateFiberCoreSplitterConnectionDto,
  ): Promise<FiberCoreSplitterConnection> {

    return this.dataSource.transaction(
      async (manager) => {

        const connectionRepo = manager.getRepository(FiberCoreSplitterConnection);

        const splitterPortRepo = manager.getRepository(OpticalSplitterPort);

        const fiberCoreRepo = manager.getRepository(FiberCore);

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
        // Find Splitter Port
        // --------------------------------------------------

        const splitterPort = await splitterPortRepo.findOne({
            where: {
              id: dto.opticalSplitterPortId,
            },

            relations: {
              opticalSplitter: {
                splitterRatio: true,
              },
            },
          });

        if (!splitterPort) {
          throw new NotFoundException(
            `Optical splitter port with ID ${dto.opticalSplitterPortId} not found.`,
          );
        }

        // --------------------------------------------------
        // Validate Splitter Port Type
        // --------------------------------------------------

        if (
          splitterPort.portType !== OpticalSplitterPortType.INPUT &&
          splitterPort.portType !== OpticalSplitterPortType.OUTPUT
        ) {
          throw new BadRequestException(
            'Invalid optical splitter port type.',
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
        // Active status
        // --------------------------------------------------

        const activeStatus = await this.getStatus(
            'ACTIVE',
            manager,
          );

        // --------------------------------------------------
        // Check Splitter Input
        // --------------------------------------------------

        const existingInputConnection = await connectionRepo.findOne({
            where: {
              opticalSplitterPortId:
                dto.opticalSplitterPortId,

              statusId:
                activeStatus.id,
            },
          });

        if (existingInputConnection) {
          throw new BadRequestException(
            'Optical splitter port is already connected to a fiber core.',
          );
        }

        // --------------------------------------------------
        // Create
        // --------------------------------------------------

        const connection = connectionRepo.create({
            fiberCoreId: dto.fiberCoreId,
            fiberCore,
            fiberCoreSide: dto.fiberCoreSide,
            opticalSplitterPortId: dto.opticalSplitterPortId,
            opticalSplitterPort: splitterPort,
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
        // Return
        // --------------------------------------------------

        const result = await connectionRepo.findOne({
            where: {
              id: savedConnection.id,
            },

            relations: {
              fiberCore: {
                fiberCable: {
                  asset: true,
                },

                status: true,
              },

              opticalSplitterPort: {
                opticalSplitter: {
                  splitterRatio: true,
                },
              },

              status: true,
            },
          });

        if (!result) {
          throw new NotFoundException(
            `Fiber core splitter connection with ID ${savedConnection.id} not found after creation.`,
          );
        }

        return result;
      },
    );
  }

  // ========================================================
  // Disconnect
  // ========================================================

  async disconnect(
    id: string,
  ): Promise<FiberCoreSplitterConnection> {

    return this.dataSource.transaction(
      async (manager) => {

        const connectionRepo = manager.getRepository(FiberCoreSplitterConnection);

        const connection = await connectionRepo.findOne({
            where: {
              id,
            },

            relations: {
              status: true,

              fiberCore: {
                fiberCable: {
                  asset: true,
                },

                status: true,
              },

              opticalSplitterPort: {
                opticalSplitter: {
                  splitterRatio: true,
                },
              },
            },
          });

        if (!connection) {
          throw new NotFoundException(
            `Fiber core splitter connection with ID ${id} not found.`,
          );
        }

        if (connection.status.code !== 'ACTIVE') {
          throw new BadRequestException(
            `Fiber core splitter connection with ID ${id} is not active.`,
          );
        }

        const disconnectedStatus = await this.getStatus(
            'DISCONNECTED',
            manager,
          );

        await connectionRepo.update(
          connection.id,
          {
            statusId:
              disconnectedStatus.id,
          },
        );

        await this.fiberCoreConnectionService.updateCoreStatus(
          connection.fiberCoreId,
          manager,
        );

        const result = await connectionRepo.findOne({
            where: {
              id: connection.id,
            },

            relations: {
              fiberCore: {
                fiberCable: {
                  asset: true,
                },

                status: true,
              },

              opticalSplitterPort: {
                opticalSplitter: {
                  splitterRatio: true,
                },
              },

              status: true,
            },
          });

        if (!result) {
          throw new NotFoundException(
            `Fiber core splitter connection with ID ${id} not found after disconnection.`,
          );
        }

        return result;
      },
    );
  }

  // ========================================================
  // Find One
  // ========================================================

  async findOne(
    id: string,
  ): Promise<FiberCoreSplitterConnection> {

    const repo = this.dataSource.getRepository(FiberCoreSplitterConnection);

    const connection = await repo.findOne({
        where: {
          id,
        },

        relations: {
          fiberCore: {
            fiberCable: {
              asset: true,
            },

            status: true,
          },

          opticalSplitterPort: {
            opticalSplitter: {
              splitterRatio: true,
            },
          },

          status: true,
        },
      });

    if (!connection) {
      throw new NotFoundException(
        `Fiber core splitter connection with ID ${id} not found.`,
      );
    }

    return connection;
  }

  // ========================================================
  // Find All
  // ========================================================

  async findAll(): Promise<FiberCoreSplitterConnection[]> {

    return this.dataSource
      .getRepository(FiberCoreSplitterConnection)
      .find({
        relations: {
          fiberCore: {
            fiberCable: {
              asset: true,
            },

            status: true,
          },

          opticalSplitterPort: {
            opticalSplitter: {
              splitterRatio: true,
            },
          },

          status: true,
        },

        order: {
          createdAt: 'DESC',
        },
      });
  }

}