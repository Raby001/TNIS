import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FiberCoreRouterPortConnection } from './entities/fiber-core-router-port-connection.entity';
import { FiberCoreRouterPortConnectionStatus } from './entities/fiber-core-router-port-connection-status.entity';
import { RouterPort } from './entities/router-port.entity';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { CreateFiberCoreRouterPortConnectionDto } from './dto/create-fiber-core-router-port-connection.dto';
import { Router } from '../routers/entities/router.entity';
import { FiberCoreConnectionService } from '../fiber-core-connection/fiber-core-connection.service';

@Injectable()
export class FiberCoreRouterPortConnectionService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly fiberCoreConnectionService: FiberCoreConnectionService,
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
                lifecycleStatus: true,
                condition: true,
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

        await this.fiberCoreConnectionService.validateCoreSideAvailable(
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

        await this.fiberCoreConnectionService.updateCoreStatus(
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

        await this.fiberCoreConnectionService.updateCoreStatus(
          connection.fiberCoreId,
          manager,
        );

        return this.findOne(id);
      },
    );
  }
}