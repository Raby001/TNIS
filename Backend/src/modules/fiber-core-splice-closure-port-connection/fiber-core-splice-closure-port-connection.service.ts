import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { SpliceClosurePort } from '../splice-closures/entities/splice-closure-port.entity';
import { FiberCoreSpliceClosurePortConnection } from './entities/fiber-core-splice-closure-port-connection.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from './entities/fiber-core-splice-closure-port-connection-status.entity';
import { CreateFiberCoreSpliceClosurePortConnectionDto } from './dto/create-fiber-core-splice-closure-port-connection.dto';
import { FiberCoreConnectionService } from '../fiber-core-connection/fiber-core-connection.service';

@Injectable()
export class FiberCoreSpliceClosurePortConnectionsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly fiberCoreConnectionService: FiberCoreConnectionService,
  ) {}


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

        await this.fiberCoreConnectionService.validateCoreSideAvailable(
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
        // Recalculate Fiber Core status
        // ---------------------------------------------------

        await this.fiberCoreConnectionService.updateCoreStatus(
          fiberCore.id,
          manager,
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
        await this.fiberCoreConnectionService.updateCoreStatus(
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