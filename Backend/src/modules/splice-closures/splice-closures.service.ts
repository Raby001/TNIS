import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SpliceClosure } from './entities/splice-closure.entity';
import { UpdateSpliceClosureDto } from './dto/update-splice-closure.dto';
import { CreateSpliceClosureDto } from './dto/create-splice-closure.dto';
import { AssetsService } from '../assets/assets.service';
import { DataSource } from 'typeorm';
import { Asset } from '../assets/entities/asset.entity';
import { SpliceClosurePort } from './entities/splice-closure-port.entity';
import { FiberSplice } from '../fiber-splices/entities/fiber-splice.entity';
import { FiberCoreSpliceClosurePortConnection } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection.entity';

@Injectable()
export class SpliceClosuresService {
  constructor(
    @InjectRepository(SpliceClosure)
    private readonly spliceClosureRepository: Repository<SpliceClosure>,

    private readonly assetService: AssetsService,

    private readonly dataSource: DataSource,
  ) {}

  
  // =======================================
  // ============== Create
  // =======================================

  async create(
    dto: CreateSpliceClosureDto,
    userId: string,
  ): Promise<SpliceClosure> {
    const result = await this.dataSource.transaction(
      async (manager) => {
        return this.createInternal(
          dto,
          userId,
          manager,
        );
      },
    );

    return this.findOne(result.assetId);
  }

  async createInternal(
    dto: CreateSpliceClosureDto,
    userId: string,
    manager: EntityManager,
  ): Promise<SpliceClosure> {

        const spliceClosureRepo = manager.getRepository(SpliceClosure);
        const spliceClosurePortRepo = manager.getRepository(SpliceClosurePort);

        // Create Asset through the transaction
        const asset = await this.assetService.createInternal(
            {
              name: dto.name,
              assetTypeId: dto.assetTypeId,
              manufacturer: dto.manufacturer,
              model: dto.model,
              lifecycleStatusId: dto.lifecycleStatusId,
              conditionId: dto.conditionId,
              siteId: dto.siteId,
              description: dto.description,
              geometry: dto.geometry,

              assetTag: dto.assetTag,
              serialNumber: dto.serialNumber,

              purchaseDate: dto.purchaseDate,
              installationDate: dto.installationDate,
              warrantyStart: dto.warrantyStart,
              warrantyEnd: dto.warrantyEnd,
            },
            userId,
            manager,
          );

        // Create Splice Closure
        const spliceClosure = spliceClosureRepo.create({
            assetId: asset.id,
            
            closureType: dto.closureType,

            capacity: dto.capacity ?? null
          });

        await spliceClosureRepo.save(spliceClosure);

        // Create Splice Closure Ports

        const capacity = dto.capacity ?? 0;

        if (capacity > 0) {
          const ports = Array.from(
            { length: capacity },
            (_, index) =>
              spliceClosurePortRepo.create({
                spliceClosureId: spliceClosure.assetId,
                portNumber: index + 1,
              }),
          );

          await spliceClosurePortRepo.save(ports);
        }

        // Return complete object
        const result = await spliceClosureRepo.findOne({
            where: {
              assetId: asset.id,
            },

            relations: {
              asset: {
                site: true,
                assetType: true,
                lifecycleStatus: true,
                condition: true,
              },
            },
          });

        if (!result) {
          throw new NotFoundException(
            `Splice Closure with asset ID ${asset.id} not found after creation.`,
          );
        }

        return result;

  }

  // ========================================
  // ============== Find/Get
  // ========================================

  async findAll(): Promise<SpliceClosure[]> {

    const spliceClosureRepo = this.dataSource.getRepository(SpliceClosure);

    return spliceClosureRepo.find({
      relations: {
        asset: {
          assetType: true,
          lifecycleStatus: true,
          condition: true,
        },
        ports: true,
      },
    });
  }
  


  async findOne(id: string) {
    const spliceClosure =
      await this.spliceClosureRepository.findOne({
        where: {
          assetId: id,
        },

        relations: {
          asset: {
            assetType: true,
            lifecycleStatus: true,
            condition: true,
            site: true,
            createdBy: true,
            updatedBy: true,
          },

          ports: true,
        },
      });

    if (!spliceClosure) {
      throw new NotFoundException(
        `Splice closure with Asset ID ${id} not found.`,
      );
    }

    // =======================================================
    // Get repositories
    // =======================================================

    const coreConnectionRepository = this.dataSource.getRepository(FiberCoreSpliceClosurePortConnection);

    const spliceRepository = this.dataSource.getRepository(FiberSplice);

    // =======================================================
    // Get active FiberCore - SpliceClosurePort connections
    // =======================================================

    const coreConnections = await coreConnectionRepository.find({
        where: {
          spliceClosurePort: {
            spliceClosureId: spliceClosure.assetId,
          },

          status: {
            code: 'ACTIVE',
          },
        },

        relations: {
          status: true,

          fiberCore: {
            fiberCable: true,
            status: true,
          },

          spliceClosurePort: true,
        },
      });

    // =======================================================
    // Get FiberSplices using these ports
    // =======================================================

    const fiberSplices =
      await spliceRepository.find({
        where: [
          {
            spliceClosurePortA: {
              spliceClosureId: spliceClosure.assetId,
            },
          },
          {
            spliceClosurePortB: {
              spliceClosureId: spliceClosure.assetId,
            },
          },
        ],

        relations: {
          spliceClosurePortA: true,
          spliceClosurePortB: true,
          status: true,
        },
      });

    // =======================================================
    // Map core connections by port ID
    // =======================================================

    const coreConnectionByPortId = new Map(
      coreConnections.map((connection) => [
        connection.spliceClosurePortId,
        connection,
      ]),
    );

    // =======================================================
    // Map fiber splices by port ID
    // =======================================================

    const spliceByPortId = new Map<string, FiberSplice>();

    for (const splice of fiberSplices) {
      spliceByPortId.set(
        splice.spliceClosurePortAId,
        splice,
      );

      spliceByPortId.set(
        splice.spliceClosurePortBId,
        splice,
      );
    }

    // =======================================================
    // Add port availability
    // =======================================================

    const ports = spliceClosure.ports.map((port) => {
      const coreConnection =
        coreConnectionByPortId.get(port.id);

      const fiberSplice =
        spliceByPortId.get(port.id);

      // -----------------------------------------------
      // Connected to a Fiber Core
      // -----------------------------------------------

      if (coreConnection) {
        return {
          ...port,

          status: 'USED',

          connection: {
            type: 'FIBER_CORE',

            id: coreConnection.id,

            fiberCoreId: coreConnection.fiberCoreId,

            fiberCoreSide: coreConnection.fiberCoreSide,

            status: coreConnection.status.code,

            fiberCableId: coreConnection.fiberCore.fiberCableId,

            coreNumber: coreConnection.fiberCore.coreNumber,

            fiberCoreStatus: coreConnection.fiberCore.status,
          },
        };
      }

      // -----------------------------------------------
      // Used by a Fiber Splice
      // -----------------------------------------------

      if (fiberSplice) {
        return {
          ...port,

          status: 'USED',

          connection: {
            type: 'FIBER_SPLICE',

            id: fiberSplice.id,

            status: fiberSplice.status.code,

            spliceClosurePortAId: fiberSplice.spliceClosurePortAId,

            spliceClosurePortBId: fiberSplice.spliceClosurePortBId,
          },
        };
      }

      // -----------------------------------------------
      // Available
      // -----------------------------------------------

      return {
        ...port,

        status: 'AVAILABLE',

        connection: null,
      };
    });

    return {
      ...spliceClosure,

      ports,
    };
  }

  // ========================================
  // ============== Update
  // ========================================
  async update(
    id: string,
    dto: UpdateSpliceClosureDto,
    userId: string, 
  ): Promise<SpliceClosure> {

    return this.dataSource.transaction(
      async (manager) => {

        const spliceClosureRepo = manager.getRepository(SpliceClosure);

        // Find the specialized record
        const spliceClosure = await spliceClosureRepo.findOne({
            where: {
              assetId: id,
            },
          });

        if (!spliceClosure) {
          throw new NotFoundException(
            `Splice closure with Asset ID ${id} not found.`,
          );
        }

        // ---------------------------------------------
        // 1. Update Asset
        // ---------------------------------------------

        await this.assetService.updateInternal(
          id,
          {
            name: dto.name,
            manufacturer: dto.manufacturer,
            model: dto.model,
            lifecycleStatusId: dto.lifecycleStatusId,
            conditionId: dto.conditionId,
            assetTag: dto.assetTag,
            serialNumber: dto.serialNumber,
            description: dto.description,

            purchaseDate: dto.purchaseDate,
            installationDate: dto.installationDate,
            warrantyStart: dto.warrantyStart,
            warrantyEnd: dto.warrantyEnd,

            geometry: dto.geometry,
          },
          userId,
          manager,
        );

        // ---------------------------------------------
        // 2. Update Splice Closure fields
        // ---------------------------------------------

        if (dto.closureType !== undefined) {
          spliceClosure.closureType = dto.closureType;
        }

        if (dto.capacity !== undefined) {
          spliceClosure.capacity = dto.capacity;
        }

        // ---------------------------------------------
        // 3. Save Splice Closure
        // ---------------------------------------------

        await spliceClosureRepo.save(spliceClosure);

        // ---------------------------------------------
        // 4. Return complete record
        // ---------------------------------------------

        const result = await spliceClosureRepo.findOne({
            where: {
              assetId: id,
            },

            relations: {
              asset: {
                assetType: true,
                lifecycleStatus: true,
                condition: true,
              },
            },
            
          });

        if (!result) {
          throw new NotFoundException(
            `Splice closure with Asset ID ${id} not found after update.`,
          );
        }

        return result;
      },
    );
  }

  // ===================================================
  // Delete
  // ===================================================


  async remove(id: string): Promise<{ message: string }> {
    const spliceClosure = await this.spliceClosureRepository.findOne({
      where: { assetId: id },
    });

    if (!spliceClosure) {
      throw new NotFoundException(
        `Splice closure with Asset ID ${id} not found.`,
      );
    }

    await this.assetService.remove(id);

    return {
      message: `Splice closure with Asset ID ${id} deleted successfully.`,
    };
  }


}