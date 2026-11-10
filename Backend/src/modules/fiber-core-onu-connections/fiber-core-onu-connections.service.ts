import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FiberCoreOnuConnection } from './entities/fiber-core-onu-connection.entity';
import { FiberCoreOnuConnectionStatus } from './entities/fiber-core-onu-connection-status.entity';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { FiberCoreSide } from '../cables/enums/fiber-core-side.enum';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';
import { FiberSplice } from '../fiber-splices/entities/fiber-splice.entity';
import { FiberSpliceStatus } from '../fiber-splices/entities/fiber-splice-status.entity';
import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';
import { Onu } from '../onus/entities/onu.entity';
import { CreateFiberCoreOnuConnectionDto } from './dto/create-fiber-core-onu-connection.dto';
import { FiberCoreOccPortConnectionStatus } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection-status.entity';
import { FiberCoreOccPortConnection } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection-status.entity';
import { FiberCoreSpliceClosurePortConnection } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection.entity';

@Injectable()
export class FiberCoreOnuConnectionsService {
 constructor(
    private readonly dataSource: DataSource,
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
          `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to an optical splitter.`,
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
  // Helper: Update Core Status
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


    // Optical splitter connection

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

    // ONU connection

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
        `Fiber Core status "${hasActiveConnection ? 'IN_USE' : 'AVAILABLE'}" not found.`,
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

        await this.validateCoreSideAvailable(
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

        await this.updateCoreStatus(
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

        await this.updateCoreStatus(
          connection.fiberCoreId,
          manager,
        );

        return this.findOne(id);
      },
    );
  }
}