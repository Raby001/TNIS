import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FiberCoreSplitterConnection } from './entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from './entities/fiber-core-splitter-connection-status.entity';
import { OpticalSplitterPort, OpticalSplitterPortType } from '../optical-splitters/entities/optical-splitter-port.entity';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { FiberCoreSide } from '../cables/enums/fiber-core-side.enum';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';
import { FiberSplice } from '../fiber-splices/entities/fiber-splice.entity';
import { FiberSpliceStatus } from '../fiber-splices/entities/fiber-splice-status.entity';
import { CreateFiberCoreSplitterConnectionDto } from './dto/create-fiber-core-splitter-connection.dto';
import { FiberCoreOccPortConnectionStatus } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection-status.entity';
import { FiberCoreOccPortConnection } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection-status.entity';
import { FiberCoreSpliceClosurePortConnection } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection.entity';

@Injectable()
export class FiberCoreSplitterConnectionsService {

  constructor(
    private readonly dataSource: DataSource,
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
  // Helper: Validate Core Side
  // ========================================================

  private async validateCoreSideAvailable(
    fiberCoreId: string,
    fiberCoreSide: FiberCoreSide,
    manager: EntityManager,
  ): Promise<void> {

    // ------------------------------------------------------
    // Fiber Splice
    // ------------------------------------------------------

    const spliceStatusRepo = manager.getRepository(FiberSpliceStatus);

    const activeSpliceStatus = await spliceStatusRepo.findOne({
        where: {
          code: 'ACTIVE',
        },
      });

    if (activeSpliceStatus) {

      const spliceRepo = manager.getRepository(FiberSplice);

      const existingSplice = await spliceRepo
          .createQueryBuilder('splice')
          .where(
            `(
              (
                splice.source_core_id = :coreId
                AND splice.source_core_side = :side
              )
              OR
              (
                splice.destination_core_id = :coreId
                AND splice.destination_core_side = :side
              )
            )`,
            {
              coreId: fiberCoreId,
              side: fiberCoreSide,
            },
          )
          .andWhere(
            'splice.status_id = :statusId',
            {
              statusId: activeSpliceStatus.id,
            },
          )
          .getOne();

      if (existingSplice) {
        throw new BadRequestException(
          `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected by a fiber splice.`,
        );
      }
    }


    // ------------------------------------------------------
    // Splitter Connection
    // ------------------------------------------------------

    const connectionRepo = manager.getRepository(FiberCoreSplitterConnection);

    const activeStatus = await this.getStatus(
        'ACTIVE',
        manager,
      );

    const existingSplitterConnection = await connectionRepo.findOne({
        where: {
          fiberCoreId,
          fiberCoreSide,
          statusId: activeStatus.id,
        },
      });

    if (existingSplitterConnection) {
      throw new BadRequestException(
        `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to an optical splitter.`,
      );
    }

    // ------------------------------------------------------
    // OCC Port Connection
    // ------------------------------------------------------

    const occStatus = await manager
        .getRepository(FiberCoreOccPortConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (occStatus) {

      const existingOccConnection = await manager
          .getRepository(FiberCoreOccPortConnection)
          .findOne({
            where: {
              fiberCoreId: fiberCoreId,
              fiberCoreSide: fiberCoreSide,
              statusId: occStatus.id,
            },
          });

      if (existingOccConnection) {
        throw new BadRequestException(
          `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to an OCC port.`,
        );
      }
    }

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

        await this.validateCoreSideAvailable(
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

        await this.updateCoreStatus(
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

        await this.updateCoreStatus(
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

  // ========================================================
  // Update Fiber Core Status
  // ========================================================

  private async updateCoreStatus(
    coreId: string,
    manager: EntityManager,
  ): Promise<void> {

    const fiberCoreRepo = manager.getRepository(FiberCore);
    let hasActiveConnection = false;

    // ------------------------------------------------------
    // Splice Closure Port Connection
    // ------------------------------------------------------

    const spliceClosurePortConnectionStatus = await manager
      .getRepository(FiberCoreSpliceClosurePortConnectionStatus)
      .findOne({
        where: {
          code: 'ACTIVE',
        },
      });

    if (spliceClosurePortConnectionStatus) {
      const spliceClosurePortConnection = await manager
        .getRepository(FiberCoreSpliceClosurePortConnection)
        .findOne({
          where: {
            fiberCoreId: coreId,
            statusId: spliceClosurePortConnectionStatus.id,
          },
        });

      if (spliceClosurePortConnection) {
        hasActiveConnection = true;
      }
    }
    
    // ------------------------------------------------------
    // Active Splitter Connection
    // ------------------------------------------------------

    const splitterStatus = await manager
        .getRepository(
          FiberCoreSplitterConnectionStatus,
        )
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (splitterStatus) {

      const activeSplitterConnection = await manager
          .getRepository(
            FiberCoreSplitterConnection,
          )
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: splitterStatus.id,
            },
          });

      if (activeSplitterConnection) {
        hasActiveConnection = true;
      }
    }

    const occStatus = await manager
        .getRepository(FiberCoreOccPortConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (occStatus) {

      const occConnection = await manager
          .getRepository(FiberCoreOccPortConnection)
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: occStatus.id,
            },
          });

      if (occConnection) {
        hasActiveConnection = true;
      }
    }

    // ------------------------------------------------------
    // Set Fiber Core Status
    // ------------------------------------------------------

    const targetStatus = await manager
        .getRepository(FiberCoreStatus)
        .findOne({
          where: {
            code: hasActiveConnection
              ? 'IN_USE'
              : 'AVAILABLE',
          },
        });

    if (!targetStatus) {
      throw new NotFoundException(
        `Fiber Core status "${
          hasActiveConnection
            ? 'IN_USE'
            : 'AVAILABLE'
        }" not found.`,
      );
    }

    await fiberCoreRepo.update(
      coreId,
      {
        statusId:
          targetStatus.id,
      },
    );
  }
}