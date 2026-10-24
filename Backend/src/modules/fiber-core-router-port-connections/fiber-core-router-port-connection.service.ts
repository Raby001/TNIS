import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FiberCoreRouterPortConnection } from './entities/fiber-core-router-port-connection.entity';
import { FiberCoreRouterPortConnectionStatus } from './entities/fiber-core-router-port-connection-status.entity';
import { RouterPort } from './entities/router-port.entity';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';
import { FiberCoreSide } from '../cables/enums/fiber-core-side.enum';
import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';
import { FiberCoreOnuConnection } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection.entity';
import { FiberCoreOnuConnectionStatus } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection-status.entity';
import { FiberCoreOccPortConnection } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection.entity';
import { FiberCoreOccPortConnectionStatus } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection-status.entity';
import { FiberCoreSpliceClosurePortConnection } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection-status.entity';
import { CreateFiberCoreRouterPortConnectionDto } from './dto/create-fiber-core-router-port-connection.dto';
import { Router } from '../routers/entities/router.entity';

@Injectable()
export class FiberCoreRouterPortConnectionService {

  constructor(
    private readonly dataSource: DataSource,
  ) {}

  // ========================================================
  // Get Status
  // ========================================================

  private async getStatus(
    code: string,
    manager: EntityManager,
  ): Promise<FiberCoreRouterPortConnectionStatus> {

    const status = await manager
      .getRepository(FiberCoreRouterPortConnectionStatus)
      .findOne({
        where: { code },
      });

    if (!status) {
      throw new NotFoundException(
        `Fiber core router port connection status "${code}" not found.`,
      );
    }

    return status;
  }

  // ========================================================
  // Validate Core Side
  // ========================================================

  private async validateCoreSideAvailable(
    fiberCoreId: string,
    fiberCoreSide: FiberCoreSide,
    manager: EntityManager,
  ): Promise<void> {

    // ------------------------------------------------------
    // Splitter
    // ------------------------------------------------------

    const splitterStatus = await manager
      .getRepository(FiberCoreSplitterConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (splitterStatus) {
      const existing = await manager
        .getRepository(FiberCoreSplitterConnection)
        .findOne({
          where: {
            fiberCoreId,
            fiberCoreSide,
            statusId: splitterStatus.id,
          },
        });

      if (existing) {
        throw new BadRequestException(
          `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to an optical splitter.`,
        );
      }
    }

    // ------------------------------------------------------
    // ONU
    // ------------------------------------------------------

    const onuStatus = await manager
      .getRepository(FiberCoreOnuConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (onuStatus) {
      const existing = await manager
        .getRepository(FiberCoreOnuConnection)
        .findOne({
          where: {
            fiberCoreId,
            fiberCoreSide,
            statusId: onuStatus.id,
          },
        });

      if (existing) {
        throw new BadRequestException(
          `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to an ONU.`,
        );
      }
    }

    // ------------------------------------------------------
    // OCC
    // ------------------------------------------------------

    const occStatus = await manager
      .getRepository(FiberCoreOccPortConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (occStatus) {
      const existing = await manager
        .getRepository(FiberCoreOccPortConnection)
        .findOne({
          where: {
            fiberCoreId,
            fiberCoreSide,
            statusId: occStatus.id,
          },
        });

      if (existing) {
        throw new BadRequestException(
          `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to an OCC port.`,
        );
      }
    }

    // ------------------------------------------------------
    // Splice Closure Port
    // ------------------------------------------------------

    const spliceClosureStatus = await manager
      .getRepository(FiberCoreSpliceClosurePortConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (spliceClosureStatus) {
      const existing = await manager
        .getRepository(FiberCoreSpliceClosurePortConnection)
        .findOne({
          where: {
            fiberCoreId,
            fiberCoreSide,
            statusId: spliceClosureStatus.id,
          },
        });

      if (existing) {
        throw new BadRequestException(
          `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to a splice closure port.`,
        );
      }
    }

    // ------------------------------------------------------
    // Router
    // ------------------------------------------------------

    const routerStatus = await manager
      .getRepository(FiberCoreRouterPortConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (routerStatus) {
      const existing = await manager
        .getRepository(FiberCoreRouterPortConnection)
        .findOne({
          where: {
            fiberCoreId,
            fiberCoreSide,
            statusId: routerStatus.id,
          },
        });

      if (existing) {
        throw new BadRequestException(
          `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to a router port.`,
        );
      }
    }
  }

  // ========================================================
  // Update Core Status
  // ========================================================

  private async updateCoreStatus(
    coreId: string,
    manager: EntityManager,
  ): Promise<void> {

    let hasActiveConnection = false;

    const checks = [
      [
        FiberCoreSplitterConnection,
        FiberCoreSplitterConnectionStatus,
      ],
      [
        FiberCoreOnuConnection,
        FiberCoreOnuConnectionStatus,
      ],
      [
        FiberCoreOccPortConnection,
        FiberCoreOccPortConnectionStatus,
      ],
      [
        FiberCoreSpliceClosurePortConnection,
        FiberCoreSpliceClosurePortConnectionStatus,
      ],
      [
        FiberCoreRouterPortConnection,
        FiberCoreRouterPortConnectionStatus,
      ],
    ];

    for (const [connectionEntity, statusEntity] of checks) {
      const status = await manager
        .getRepository(statusEntity as any)
        .findOne({
          where: { code: 'ACTIVE' },
        });

      if (!status) {
        continue;
      }

      const connection = await manager
        .getRepository(connectionEntity as any)
        .findOne({
          where: {
            fiberCoreId: coreId,
            statusId: status.id,
          },
        });

      if (connection) {
        hasActiveConnection = true;
        break;
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

    await manager
      .getRepository(FiberCore)
      .update(coreId, {
        statusId: targetStatus.id,
      });
  }

  // ========================================================
  // Increment Router Used Port Count
  // ========================================================

  private async incrementUsedPortCount(
    routerAssetId: string,
    manager: EntityManager,
  ): Promise<void> {

    const router = await manager
      .getRepository(Router)
      .findOne({
        where: {
          assetId: routerAssetId,
        },
      });

    if (!router) {
      throw new NotFoundException(
        `Router with Asset ID ${routerAssetId} not found.`,
      );
    }

    if (router.usedPortCount >= router.portCount) {
      throw new BadRequestException(
        `Router with Asset ID ${routerAssetId} has no available ports.`,
      );
    }

    router.usedPortCount += 1;

    await manager
      .getRepository(Router)
      .save(router);
  }

  // ========================================================
  // Decrement Router Used Port Count
  // ========================================================

  private async decrementUsedPortCount(
    routerAssetId: string,
    manager: EntityManager,
  ): Promise<void> {

    const router = await manager
      .getRepository(Router)
      .findOne({
        where: {
          assetId: routerAssetId,
        },
      });

    if (!router) {
      throw new NotFoundException(
        `Router with Asset ID ${routerAssetId} not found.`,
      );
    }

    if (router.usedPortCount <= 0) {
      throw new BadRequestException(
        `Router with Asset ID ${routerAssetId} has an invalid used port count.`,
      );
    }

    router.usedPortCount -= 1;

    await manager
      .getRepository(Router)
      .save(router);
  }

  // ========================================================
  // Create
  // ========================================================

  async create(
    dto: CreateFiberCoreRouterPortConnectionDto,
  ): Promise<FiberCoreRouterPortConnection> {

    return this.dataSource.transaction(
      async (manager) => {

        const connectionRepo = manager.getRepository(FiberCoreRouterPortConnection);

        const fiberCoreRepo = manager.getRepository(FiberCore);

        const routerPortRepo = manager.getRepository(RouterPort);

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
        // Find Router Port
        // --------------------------------------------------

        const routerPort = await routerPortRepo.findOne({
          where: {
            id: dto.routerPortId,
          },
          relations: {
            router: {
              asset: {
                assetType: true,
                status: true,
                site: true,
              },
            },
          },
        });

        if (!routerPort) {
          throw new NotFoundException(
            `Router port with ID ${dto.routerPortId} not found.`,
          );
        }

        if (!routerPort.router) {
          throw new BadRequestException(
            `Router port ${dto.routerPortId} is not associated with a router.`,
          );
        }

        if (
          routerPort.router.asset?.assetType?.qualifier
            ?.trim()
            .toUpperCase() !== 'RTR'
        ) {
          throw new BadRequestException(
            `Asset "${routerPort.router.assetId}" is not a Router asset.`,
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
        // Active Status
        // --------------------------------------------------

        const activeStatus = await this.getStatus(
          'ACTIVE',
          manager,
        );

        // --------------------------------------------------
        // Check Router Port Availability
        // --------------------------------------------------

        const existingConnection = await connectionRepo.findOne({
          where: {
            routerPortId: dto.routerPortId,
            statusId: activeStatus.id,
          },
        });

        if (existingConnection) {
          throw new BadRequestException(
            `Router port ${routerPort.portNumber} is already connected.`,
          );
        }

        // --------------------------------------------------
        // Create Connection
        // --------------------------------------------------

        const connection = connectionRepo.create({
          fiberCoreId: dto.fiberCoreId,
          fiberCore,
          fiberCoreSide: dto.fiberCoreSide,

          routerPortId: dto.routerPortId,
          routerPort,

          statusId: activeStatus.id,
          status: activeStatus,
        });

        const savedConnection =
          await connectionRepo.save(connection);

        // --------------------------------------------------
        // Update Router Used Port Count
        // --------------------------------------------------

        await this.incrementUsedPortCount(
          routerPort.routerAssetId,
          manager,
        );

        // --------------------------------------------------
        // Update Fiber Core Status
        // --------------------------------------------------

        await this.updateCoreStatus(
          dto.fiberCoreId,
          manager,
        );

        // --------------------------------------------------
        // Return Created Connection
        // --------------------------------------------------

        const result = await manager
          .getRepository(FiberCoreRouterPortConnection)
          .findOne({
            where: {
              id: savedConnection.id,
            },
            relations: {
              status: true,
              routerPort: {
                router: {
                  asset: true,
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
            `Fiber core router port connection with ID ${savedConnection.id} not found.`,
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
  ): Promise<FiberCoreRouterPortConnection> {

    const connection = await this.dataSource
      .getRepository(FiberCoreRouterPortConnection)
      .findOne({
        where: {
          id,
        },
        relations: {
          status: true,
          routerPort: {
            router: {
              asset: true,
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
        `Fiber core router port connection with ID ${id} not found.`,
      );
    }

    return connection;
  }

  // ========================================================
  // Find All
  // ========================================================

  async findAll(): Promise<FiberCoreRouterPortConnection[]> {

    return this.dataSource
      .getRepository(FiberCoreRouterPortConnection)
      .find({
        relations: {
          status: true,
          routerPort: {
            router: {
              asset: true,
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
  // Disconnect
  // ========================================================

  async disconnect(
    id: string,
  ): Promise<FiberCoreRouterPortConnection> {

    return this.dataSource.transaction(
      async (manager) => {

        const connectionRepo = manager.getRepository(FiberCoreRouterPortConnection);

        const connection = await connectionRepo.findOne({
            where: {
              id,
            },
            relations: {
              status: true,
              fiberCore: {
                status: true,
              },
              routerPort: {
                router: true,
              },
            },
          });

        if (!connection) {
          throw new NotFoundException(
            `Fiber core router port connection with ID ${id} not found.`,
          );
        }

        if (connection.status.code !== 'ACTIVE') {
          throw new BadRequestException(
            `Fiber core router port connection with ID ${id} is not active.`,
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

        await this.decrementUsedPortCount(
          connection.routerPort.routerAssetId,
          manager,
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