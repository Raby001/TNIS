import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FiberSplice } from './entities/fiber-splice.entity';
import { FiberSpliceStatus } from './entities/fiber-splice-status.entity';
import { SpliceClosurePort } from '../splice-closures/entities/splice-closure-port.entity';
import { CreateFiberSpliceDto } from './dto/create-fiber-splice.dto';
import { CreateFiberSpliceBulkDto } from './dto/create-fiber-splice-bulk.dto';

@Injectable()
export class FiberSplicesService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  // =========================================================
  // Find All
  // =========================================================

  async findAll(): Promise<FiberSplice[]> {
    const repo = this.dataSource.getRepository(FiberSplice);

    return repo.find({
      relations: {
        spliceClosurePortA: {
          spliceClosure: true,
        },
        spliceClosurePortB: {
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
  ): Promise<FiberSplice> {
    const repo = manager ? manager.getRepository(FiberSplice) : this.dataSource.getRepository(FiberSplice);

    const fiberSplice = await repo.findOne({
        where: {
          id,
        },
        relations: {
          spliceClosurePortA: {
            spliceClosure: true,
          },
          spliceClosurePortB: {
            spliceClosure: true,
          },
          status: true,
        },
      });

    if (!fiberSplice) {
      throw new NotFoundException(
        `Fiber Splice with ID ${id} not found.`,
      );
    }

    return fiberSplice;
  }

  // =========================================================
  // Validate Port
  // =========================================================

  private async validatePort(
    portId: string,
    manager: EntityManager,
  ): Promise<SpliceClosurePort> {
    const portRepo = manager.getRepository(SpliceClosurePort);

    const port = await portRepo.findOne({
        where: {
          id: portId,
        },
        relations: {
          spliceClosure: true,
        },
      });

    if (!port) {
      throw new NotFoundException(
        `Splice Closure Port with ID ${portId} not found.`,
      );
    }

    return port;
  }

  // =========================================================
  // Validate Port is not already spliced
  // =========================================================

  private async validatePortAvailable(
    portId: string,
    manager: EntityManager,
  ): Promise<void> {
    const spliceRepo = manager.getRepository(FiberSplice);

    const statusRepo = manager.getRepository(FiberSpliceStatus);

    const activeStatus = await statusRepo.findOne({
        where: {
          code: 'ACTIVE',
        },
      });

    if (!activeStatus) {
      throw new NotFoundException(
        'Fiber Splice status "ACTIVE" not found.',
      );
    }

    const existing = await spliceRepo.findOne({
        where: [
          {
            spliceClosurePortAId: portId,
            statusId: activeStatus.id,
          },
          {
            spliceClosurePortBId: portId,
            statusId: activeStatus.id,
          },
        ],
      });

    if (existing) {
      throw new BadRequestException(
        `Splice Closure Port ${portId} is already involved in an active fiber splice.`,
      );
    }
  }

  // =========================================================
  // Create
  // =========================================================

  async create(
    dto: CreateFiberSpliceDto,
  ): Promise<FiberSplice> {
    return this.dataSource.transaction(
      async (manager) => {
        const spliceRepo = manager.getRepository(FiberSplice);

        const statusRepo = manager.getRepository(FiberSpliceStatus);

        // ---------------------------------------------------
        // Same port?
        // ---------------------------------------------------

        if (dto.spliceClosurePortAId === dto.spliceClosurePortBId) {
          throw new BadRequestException(
            'Splice Closure Port A and Port B cannot be the same.',
          );
        }

        // ---------------------------------------------------
        // Find ports
        // ---------------------------------------------------

        const portA = await this.validatePort(
            dto.spliceClosurePortAId,
            manager,
          );

        const portB = await this.validatePort(
            dto.spliceClosurePortBId,
            manager,
          );

        // ---------------------------------------------------
        // Both ports must belong to same closure
        // ---------------------------------------------------

        if (portA.spliceClosureId !== portB.spliceClosureId) {
          throw new BadRequestException(
            'Both splice closure ports must belong to the same splice closure.',
          );
        }

        // ---------------------------------------------------
        // Check both ports
        // ---------------------------------------------------

        await this.validatePortAvailable(
          portA.id,
          manager,
        );

        await this.validatePortAvailable(
          portB.id,
          manager,
        );

        // ---------------------------------------------------
        // Active status
        // ---------------------------------------------------

        const activeStatus = await statusRepo.findOne({
            where: {
              code: 'ACTIVE',
            },
          });

        if (!activeStatus) {
          throw new NotFoundException(
            'Fiber Splice status "ACTIVE" not found.',
          );
        }

        // ---------------------------------------------------
        // Create splice
        // ---------------------------------------------------

        const fiberSplice = spliceRepo.create({
            spliceClosurePortAId:
              portA.id,

            spliceClosurePortBId:
              portB.id,

            statusId:
              activeStatus.id,
          });

        const saved = await spliceRepo.save(
            fiberSplice,
          );

        return this.findOne(
          saved.id,
          manager,
        );
      },
    );
  }

  // =========================================================
  // Bulk Create
  // =========================================================

  async createBulk(
    dto: CreateFiberSpliceBulkDto,
  ): Promise<FiberSplice[]> {
    return this.dataSource.transaction(
      async (manager) => {
        const spliceRepo = manager.getRepository(FiberSplice);

        const statusRepo = manager.getRepository(FiberSpliceStatus);

        const activeStatus = await statusRepo.findOne({
            where: {
              code: 'ACTIVE',
            },
          });

        if (!activeStatus) {
          throw new NotFoundException(
            'Fiber Splice status "ACTIVE" not found.',
          );
        }

        const usedPorts = new Set<string>();

        // ---------------------------------------------------
        // Validate every connection first
        // ---------------------------------------------------

        for (const connection of dto.connections) {
          if (connection.spliceClosurePortAId === connection.spliceClosurePortBId
          ) {
            throw new BadRequestException(
              'Splice Closure Port A and Port B cannot be the same.',
            );
          }

          if (usedPorts.has(connection.spliceClosurePortAId)) {
            throw new BadRequestException(
              `Splice Closure Port ${connection.spliceClosurePortAId} is used more than once in this request.`,
            );
          }

          if (usedPorts.has(connection.spliceClosurePortBId)) {
            throw new BadRequestException(
              `Splice Closure Port ${connection.spliceClosurePortBId} is used more than once in this request.`,
            );
          }

          usedPorts.add(connection.spliceClosurePortAId);

          usedPorts.add(connection.spliceClosurePortBId);

          const portA =await this.validatePort(
              connection.spliceClosurePortAId,
              manager,
            );

          const portB = await this.validatePort(
              connection.spliceClosurePortBId,
              manager,
            );

          if (portA.spliceClosureId !== portB.spliceClosureId) {
            throw new BadRequestException(
              'Both splice closure ports in a fiber splice must belong to the same splice closure.',
            );
          }

          await this.validatePortAvailable(
            portA.id,
            manager,
          );

          await this.validatePortAvailable(
            portB.id,
            manager,
          );
        }

        // ---------------------------------------------------
        // Create all splices
        // ---------------------------------------------------

        const splices = dto.connections.map(
            (connection) =>
              spliceRepo.create({
                spliceClosurePortAId: connection.spliceClosurePortAId,

                spliceClosurePortBId: connection.spliceClosurePortBId,

                statusId: activeStatus.id,
              }),
          );

        const saved = await spliceRepo.save(splices);

        // ---------------------------------------------------
        // Return complete result
        // ---------------------------------------------------

        return spliceRepo.find({
          where: saved.map(
            (splice) => ({
              id: splice.id,
            }),
          ),
          relations: {
            spliceClosurePortA: {
              spliceClosure: true,
            },
            spliceClosurePortB: {
              spliceClosure: true,
            },
            status: true,
          },
          order: {
            createdAt: 'ASC',
          },
        });
      },
    );
  }

  // =========================================================
  // Disconnect
  // =========================================================

  async disconnect(
    id: string,
  ): Promise<FiberSplice> {
    return this.dataSource.transaction(
      async (manager) => {
        const spliceRepo = manager.getRepository(FiberSplice);

        const statusRepo = manager.getRepository(FiberSpliceStatus);

        const splice = await spliceRepo.findOne({
            where: {
              id,
            },
            relations: {
              spliceClosurePortA: {
                spliceClosure: true,
              },
              spliceClosurePortB: {
                spliceClosure: true,
              },
              status: true,
            },
          });

        if (!splice) {
          throw new NotFoundException(
            `Fiber Splice with ID ${id} not found.`,
          );
        }

        if (splice.status.code !== 'ACTIVE') {
          throw new BadRequestException(
            `Fiber Splice with ID ${id} is not active.`,
          );
        }

        const disconnectedStatus = await statusRepo.findOne({
            where: {
              code: 'DISCONNECTED',
            },
          });

        if (!disconnectedStatus) {
          throw new NotFoundException(
            'Fiber Splice status "DISCONNECTED" not found.',
          );
        }

        await spliceRepo.update(
          id,
          {
            statusId:
              disconnectedStatus.id,
          },
        );

        return this.findOne(
          id,
          manager,
        );
      },
    );
  }

  // =========================================================
  // Find by Splice Closure
  // =========================================================

  async findBySpliceClosure(
    spliceClosureId: string,
  ): Promise<FiberSplice[]> {
    const repo = this.dataSource.getRepository(FiberSplice);

    return repo
      .createQueryBuilder('splice')
      .leftJoinAndSelect(
        'splice.spliceClosurePortA',
        'portA',
      )
      .leftJoinAndSelect(
        'portA.spliceClosure',
        'closureA',
      )
      .leftJoinAndSelect(
        'splice.spliceClosurePortB',
        'portB',
      )
      .leftJoinAndSelect(
        'portB.spliceClosure',
        'closureB',
      )
      .leftJoinAndSelect(
        'splice.status',
        'status',
      )
      .where(
        'closureA.asset_id = :spliceClosureId',
        {
          spliceClosureId,
        },
      )
      .orWhere(
        'closureB.asset_id = :spliceClosureId',
        {
          spliceClosureId,
        },
      )
      .orderBy(
        'splice.createdAt',
        'ASC',
      )
      .getMany();
  }
}