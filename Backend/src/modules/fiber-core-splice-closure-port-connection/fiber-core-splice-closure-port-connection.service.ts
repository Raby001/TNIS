import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';
import { FiberCoreSide } from '../cables/enums/fiber-core-side.enum';
import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';
import { FiberCoreOccPortConnection } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection.entity';
import { FiberCoreOccPortConnectionStatus } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection-status.entity';
import { SpliceClosurePort } from '../splice-closures/entities/splice-closure-port.entity';
import { FiberCoreSpliceClosurePortConnection } from './entities/fiber-core-splice-closure-port-connection.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from './entities/fiber-core-splice-closure-port-connection-status.entity';
import { CreateFiberCoreSpliceClosurePortConnectionDto } from './dto/create-fiber-core-splice-closure-port-connection.dto';

@Injectable()
export class FiberCoreSpliceClosurePortConnectionsService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  // =========================================================
  // Helper: Check whether a FiberCore side is already used
  // =========================================================

  private async validateCoreSideAvailable(
    coreId: string,
    side: FiberCoreSide,
    manager: EntityManager,
  ): Promise<void> {

    // -------------------------------------------------------
    // Optical Splitter
    // -------------------------------------------------------

    const splitterStatusRepo = manager.getRepository(FiberCoreSplitterConnectionStatus);

    const activeSplitterStatus = await splitterStatusRepo.findOne({
        where: {
          code: 'ACTIVE',
        },
      });

    if (activeSplitterStatus) {
      const splitterConnectionRepo = manager.getRepository(FiberCoreSplitterConnection);

      const existingSplitterConnection = await splitterConnectionRepo.findOne({
          where: {
            fiberCoreId: coreId,
            fiberCoreSide: side,
            statusId: activeSplitterStatus.id,
          },
        });

      if (existingSplitterConnection) {
        throw new BadRequestException(
          `Fiber core ${coreId} ${side} side is already connected to an optical splitter port.`,
        );
      }
    }

    // -------------------------------------------------------
    // OCC
    // -------------------------------------------------------

    const occStatusRepo = manager.getRepository(FiberCoreOccPortConnectionStatus);

    const activeOccStatus = await occStatusRepo.findOne({
        where: {
          code: 'ACTIVE',
        },
      });

    if (activeOccStatus) {
      const occConnectionRepo = manager.getRepository(FiberCoreOccPortConnection);

      const existingOccConnection = await occConnectionRepo.findOne({
          where: {
            fiberCoreId: coreId,
            fiberCoreSide: side,
            statusId: activeOccStatus.id,
          },
        });

      if (existingOccConnection) {
        throw new BadRequestException(
          `Fiber core ${coreId} ${side} side is already connected to an OCC port.`,
        );
      }
    }

    // -------------------------------------------------------
    // Splice Closure Port
    // -------------------------------------------------------

    const spliceClosureStatusRepo = manager.getRepository(FiberCoreSpliceClosurePortConnectionStatus);

    const activeSpliceClosureStatus = await spliceClosureStatusRepo.findOne({
        where: {
          code: 'ACTIVE',
        },
      });

    if (activeSpliceClosureStatus) {
      const spliceClosureConnectionRepo = manager.getRepository(FiberCoreSpliceClosurePortConnection);

      const existingSpliceClosureConnection = await spliceClosureConnectionRepo.findOne({
          where: {
            fiberCoreId: coreId,
            fiberCoreSide: side,
            statusId: activeSpliceClosureStatus.id,
          },
        });

      if (existingSpliceClosureConnection) {
        throw new BadRequestException(
          `Fiber core ${coreId} ${side} side is already connected to a splice closure port.`,
        );
      }
    }
  }

  // =========================================================
  // Helper: Recalculate FiberCore status
  // =========================================================

  private async updateCoreStatus(
    coreId: string,
    manager: EntityManager,
  ): Promise<void> {
    const fiberCoreRepo = manager.getRepository(FiberCore);

    const fiberCoreStatusRepo = manager.getRepository(FiberCoreStatus);

    let hasActiveConnection = false;

    // -------------------------------------------------------
    // Optical Splitter
    // -------------------------------------------------------

    const activeSplitterStatus = await manager
        .getRepository(FiberCoreSplitterConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (activeSplitterStatus) {
      const connection = await manager
          .getRepository(FiberCoreSplitterConnection)
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: activeSplitterStatus.id,
            },
          });

      if (connection) {
        hasActiveConnection = true;
      }
    }

    // -------------------------------------------------------
    // OCC
    // -------------------------------------------------------

    const activeOccStatus = await manager
        .getRepository(FiberCoreOccPortConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (activeOccStatus) {
      const connection = await manager
          .getRepository(FiberCoreOccPortConnection)
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: activeOccStatus.id,
            },
          });

      if (connection) {
        hasActiveConnection = true;
      }
    }

    // -------------------------------------------------------
    // Splice Closure Port
    // -------------------------------------------------------

    const activeSpliceClosureStatus = await manager
        .getRepository(FiberCoreSpliceClosurePortConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (activeSpliceClosureStatus) {
      const connection = await manager
          .getRepository(FiberCoreSpliceClosurePortConnection)
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: activeSpliceClosureStatus.id,
            },
          });

      if (connection) {
        hasActiveConnection = true;
      }
    }

    // -------------------------------------------------------
    // Set final status
    // -------------------------------------------------------

    const targetStatus = await fiberCoreStatusRepo.findOne({
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

    await fiberCoreRepo.update(coreId, {
      statusId: targetStatus.id,
    });
  }

  // =========================================================
  // Create
  // =========================================================

  async create(
    dto: CreateFiberCoreSpliceClosurePortConnectionDto,
  ): Promise<FiberCoreSpliceClosurePortConnection> {
    return this.dataSource.transaction(
      async (manager) => {
        const connectionRepo = manager.getRepository(FiberCoreSpliceClosurePortConnection);

        const fiberCoreRepo = manager.getRepository(FiberCore);

        const portRepo = manager.getRepository(SpliceClosurePort);

        const statusRepo = manager.getRepository(FiberCoreSpliceClosurePortConnectionStatus);

        // ---------------------------------------------------
        // Validate Fiber Core
        // ---------------------------------------------------

        const fiberCore = await fiberCoreRepo.findOne({
            where: {
              id: dto.fiberCoreId,
            },
            relations: {
              fiberCable: true,
              status: true,
            },
          });

        if (!fiberCore) {
          throw new NotFoundException(
            `Fiber Core with ID ${dto.fiberCoreId} not found.`,
          );
        }

        // ---------------------------------------------------
        // Validate Splice Closure Port
        // ---------------------------------------------------

        const port = await portRepo.findOne({
            where: {
              id: dto.spliceClosurePortId,
            },
            relations: {
              spliceClosure: true,
            },
          });

        if (!port) {
          throw new NotFoundException(
            `Splice Closure Port with ID ${dto.spliceClosurePortId} not found.`,
          );
        }

        // ---------------------------------------------------
        // Validate core side
        // ---------------------------------------------------

        await this.validateCoreSideAvailable(
          fiberCore.id,
          dto.fiberCoreSide,
          manager,
        );

        // ---------------------------------------------------
        // Get ACTIVE connection status
        // ---------------------------------------------------

        const activeStatus = await statusRepo.findOne({
            where: {
              code: 'ACTIVE',
            },
          });

        if (!activeStatus) {
          throw new NotFoundException(
            'Fiber Core Splice Closure Port Connection status "ACTIVE" not found.',
          );
        }

        // ---------------------------------------------------
        // Validate port is not already connected
        // ---------------------------------------------------

        const existingConnection = await connectionRepo.findOne({
            where: {
              spliceClosurePortId:
                dto.spliceClosurePortId,
              statusId: activeStatus.id,
            },
          });

        if (existingConnection) {
          throw new BadRequestException(
            `Splice Closure Port ${dto.spliceClosurePortId} is already connected.`,
          );
        }

        // ---------------------------------------------------
        // Create connection
        // ---------------------------------------------------

        const connection = connectionRepo.create({
            fiberCoreId: dto.fiberCoreId,
            fiberCoreSide: dto.fiberCoreSide,
            spliceClosurePortId:
              dto.spliceClosurePortId,
            statusId: activeStatus.id,
          });

        const saved = await connectionRepo.save(connection);

        // ---------------------------------------------------
        // Fiber Core, IN_USE
        // ---------------------------------------------------

        const inUseStatus = await manager
            .getRepository(FiberCoreStatus)
            .findOne({
              where: {
                code: 'IN_USE',
              },
            });

        if (!inUseStatus) {
          throw new NotFoundException(
            'Fiber Core status "IN_USE" not found.',
          );
        }

        await fiberCoreRepo.update(
          fiberCore.id,
          {
            statusId: inUseStatus.id,
          },
        );

        return this.findOne(
          saved.id,
          manager,
        );
      },
    );
  }

  // =========================================================
  // Disconnect
  // =========================================================

  async disconnect(
    id: string,
  ): Promise<FiberCoreSpliceClosurePortConnection> {
    return this.dataSource.transaction(
      async (manager) => {
        const connectionRepo = manager.getRepository(FiberCoreSpliceClosurePortConnection);

        const statusRepo = manager.getRepository(FiberCoreSpliceClosurePortConnectionStatus);

        const connection = await connectionRepo.findOne({
            where: {
              id,
            },
            relations: {
              status: true,
              fiberCore: true,
              spliceClosurePort: {
                spliceClosure: true,
              },
            },
          });

        if (!connection) {
          throw new NotFoundException(
            `Fiber Core Splice Closure Port Connection with ID ${id} not found.`,
          );
        }

        if (connection.status.code !== 'ACTIVE') {
          throw new BadRequestException(
            `Connection with ID ${id} is not active.`,
          );
        }

        const disconnectedStatus = await statusRepo.findOne({
            where: {
              code: 'DISCONNECTED',
            },
          });

        if (!disconnectedStatus) {
          throw new NotFoundException(
            'Fiber Core Splice Closure Port Connection status "DISCONNECTED" not found.',
          );
        }

        await connectionRepo.update(
          id,
          {
            statusId: disconnectedStatus.id,
          },
        );

        // Recalculate core status
        await this.updateCoreStatus(
          connection.fiberCoreId,
          manager,
        );

        return this.findOne(
          id,
          manager,
        );
      },
    );
  }

  // =========================================================
  // Find All
  // =========================================================

  async findAll(): Promise<FiberCoreSpliceClosurePortConnection[]> {
    const repo = this.dataSource.getRepository(FiberCoreSpliceClosurePortConnection);

    return repo.find({
      relations: {
        fiberCore: {
          fiberCable: true,
          status: true,
        },
        spliceClosurePort: {
          spliceClosure: true,
        },
        status: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  // =========================================================
  // Find One
  // =========================================================

  async findOne(
    id: string,
    manager?: EntityManager,
  ): Promise<FiberCoreSpliceClosurePortConnection> {
    const repo = manager ? manager.getRepository(FiberCoreSpliceClosurePortConnection) : this.dataSource.getRepository(FiberCoreSpliceClosurePortConnection);

    const connection = await repo.findOne({
        where: {
          id,
        },
        relations: {
          fiberCore: {
            fiberCable: true,
            status: true,
          },
          spliceClosurePort: {
            spliceClosure: true,
          },
          status: true,
        },
      });

    if (!connection) {
      throw new NotFoundException(
        `Fiber Core Splice Closure Port Connection with ID ${id} not found.`,
      );
    }

    return connection;
  }

  // =========================================================
  // Find by Fiber Core
  // =========================================================

  async findByFiberCore(
    fiberCoreId: string,
  ): Promise<FiberCoreSpliceClosurePortConnection[]> {
    const repo = this.dataSource.getRepository(FiberCoreSpliceClosurePortConnection);

    return repo.find({
      where: {
        fiberCoreId,
      },
      relations: {
        fiberCore: true,
        spliceClosurePort: {
          spliceClosure: true,
        },
        status: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  // =========================================================
  // Find by Splice Closure Port
  // =========================================================

  async findBySpliceClosurePort(
    spliceClosurePortId: string,
  ): Promise<FiberCoreSpliceClosurePortConnection[]> {
    const repo = this.dataSource.getRepository(FiberCoreSpliceClosurePortConnection);

    return repo.find({
      where: {
        spliceClosurePortId,
      },
      relations: {
        fiberCore: true,
        spliceClosurePort: {
          spliceClosure: true,
        },
        status: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }
}