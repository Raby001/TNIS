import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FiberCoreOccPortConnection } from './entities/fiber-core-occ-port-connection.entity';
import { FiberCoreOccPortConnectionStatus } from './entities/fiber-core-occ-port-connection-status.entity';
import { OccPort } from './entities/occ-port.entity';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { FiberCoreSide } from '../cables/enums/fiber-core-side.enum';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';
import { FiberSplice } from '../fiber-splices/entities/fiber-splice.entity';
import { FiberSpliceStatus } from '../fiber-splices/entities/fiber-splice-status.entity';
import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';
import { FiberCoreOnuConnection } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection.entity';
import { FiberCoreOnuConnectionStatus } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection-status.entity';
import { CreateFiberCoreOccPortConnectionDto } from './dto/create-fiber-core-occ-port-connection.dto';
import { Occ } from '../occs/entities/occ.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection-status.entity';
import { FiberCoreSpliceClosurePortConnection } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection.entity';

@Injectable()
export class FiberCoreOccPortConnectionService {

  constructor(
    private readonly dataSource: DataSource,
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
  // Helper: Validate Fiber Core Side
  // ========================================================

  private async validateCoreSideAvailable(
    fiberCoreId: string,
    fiberCoreSide: FiberCoreSide,
    manager: EntityManager,
  ): Promise<void> {

    // ------------------------------------------------------
    // Fiber Splice
    // ------------------------------------------------------

    const spliceStatus = await manager
        .getRepository(FiberSpliceStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (spliceStatus) {

      const existingSplice = await manager
          .getRepository(FiberSplice)
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
              statusId: spliceStatus.id,
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
    // Optical Splitter Connection
    // ------------------------------------------------------

    const splitterStatus = await manager
        .getRepository(FiberCoreSplitterConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (splitterStatus) {

      const existingSplitterConnection = await manager
          .getRepository(FiberCoreSplitterConnection)
          .findOne({
            where: {
              fiberCoreId,
              fiberCoreSide,
              statusId: splitterStatus.id,
            },
          });

      if (existingSplitterConnection) {
        throw new BadRequestException(
          `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to an optical splitter port.`,
        );
      }
    }

    // ------------------------------------------------------
    // ONU Connection
    // ------------------------------------------------------

    const onuStatus = await manager
        .getRepository(FiberCoreOnuConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (onuStatus) {

      const existingOnuConnection = await manager
          .getRepository(FiberCoreOnuConnection)
          .findOne({
            where: {
              fiberCoreId,
              fiberCoreSide,
              statusId: onuStatus.id,
            },
          });

      if (existingOnuConnection) {
        throw new BadRequestException(
          `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to an ONU.`,
        );
      }
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
              fiberCoreId,
              fiberCoreSide,
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
  // Helper: Update Fiber Core Status
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
    // Optical Splitter Connection
    // ------------------------------------------------------

    const splitterStatus = await manager
        .getRepository(FiberCoreSplitterConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (splitterStatus) {

      const splitterConnection = await manager
          .getRepository(FiberCoreSplitterConnection)
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: splitterStatus.id,
            },
          });

      if (splitterConnection) {
        hasActiveConnection = true;
      }
    }

    // ------------------------------------------------------
    // ONU Connection
    // ------------------------------------------------------

    const onuStatus = await manager
        .getRepository(FiberCoreOnuConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (onuStatus) {

      const onuConnection = await manager
          .getRepository(FiberCoreOnuConnection)
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: onuStatus.id,
            },
          });

      if (onuConnection) {
        hasActiveConnection = true;
      }
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
        statusId: targetStatus.id,
      },
    );
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
                  status: true,
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

        await this.validateCoreSideAvailable(
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

        await this.updateCoreStatus(dto.fiberCoreId, manager );

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
                    status: true,
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
                status: true,
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
                status: true,
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
                  status: true,
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

        await this.updateCoreStatus(connection.fiberCoreId, manager);

        return this.findOne(id);
      },
    );
  }
}