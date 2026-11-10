import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Router } from './entities/router.entity';
import { Rack } from '../racks/entities/rack.entity';
import { AssetsService } from '../assets/assets.service';
import { CreateRouterDto } from './dto/create-router.dto';
import { UpdateRouterDto } from './dto/update-router.dto';
import { AssetType } from '../assets/entities/asset-type.entity';
import { RouterPort } from '../fiber-core-router-port-connections/entities/router-port.entity';
import { FiberCoreRouterPortConnection } from '../fiber-core-router-port-connections/entities/fiber-core-router-port-connection.entity';
import { Site } from '../sites/entities/site.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoutersService {
  constructor(

    @InjectRepository(Router)
    private readonly routerRepository: Repository<Router>,

    private readonly dataSource: DataSource,
    private readonly assetService: AssetsService,
  ) {}

  // ========================================================
  // Create
  // ========================================================

  async create(
    dto: CreateRouterDto,
    userId: string,
  ): Promise<Router> {
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
    dto: CreateRouterDto,
    userId: string,
    manager: EntityManager,
  ): Promise<Router> {

    const rackRepo = manager.getRepository(Rack);

    const routerRepo = manager.getRepository(Router);

    const siteRepo = manager.getRepository(Site);

    const assetTypeRepo = manager.getRepository(AssetType);

    // ========================================================
    // 1. Resolve Rack (Optional)
    // ========================================================

    let rack: Rack | null = null;

    if (dto.rackId) {

      rack = await rackRepo.findOne({
        where: {
          assetId: dto.rackId,
        },
        relations: {
          building: {
            site: true,
          },
        },
      });

      if (!rack) {
        throw new NotFoundException(
          `Rack with ID ${dto.rackId} not found.`,
        );
      }
    }

    // ========================================================
    // 2. Resolve Site
    // ========================================================

    const siteId = rack?.building?.site?.id ?? dto.siteId;

    const site = await siteRepo.findOne({
        where: {
          id: siteId,
        },
      });

    if (!site) {
      throw new NotFoundException(
        `Site with ID ${siteId} not found.`,
      );
    }

    // ========================================================
    // 3. Validate Asset Type
    // ========================================================

    const assetType = await assetTypeRepo.findOne({
        where: {
          id: dto.assetTypeId,
        },
      });

    if (!assetType) {
      throw new NotFoundException(
        `Asset type with ID ${dto.assetTypeId} not found.`,
      );
    }

    if (assetType.qualifier.trim().toUpperCase() !== 'RTR'
    ) {
      throw new BadRequestException(
        `Asset type "${assetType.name}" is not a Router asset type.`,
      );
    }

    // ========================================================
    // 4. Generate Router Code
    // ========================================================

    const existingRouters = await routerRepo.find({
        where: rack
          ? {
              rackId: rack.assetId,
            }
          : {
              asset: {
                siteId: site.id,
              },
            },
        select: {
          code: true,
        },
      });

    const routerNumbers = existingRouters.map((router) => {

        const match = router.code.match(/\.RTR(\d+)$/);

        return match ? Number(match[1]) : 0;
      });

    const nextRouterNumber =
      Math.max(
        0,
        ...routerNumbers,
      ) + 1;

    const codePrefix = rack?.code ?? site.code;

    const routerCode = `${codePrefix}.RTR${String(nextRouterNumber).padStart(2, '0')}`;

    // ========================================================
    // 5. Create Asset
    // ========================================================

    const asset = await this.assetService.createInternal(
        {
          name: dto.name,

          siteId: site.id,

          assetTypeId: dto.assetTypeId,

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

    // ========================================================
    // 6. Create Router
    // ========================================================

    const router =
      routerRepo.create({
        code: routerCode,

        assetId: asset.id,

        asset,

        rackId: rack?.assetId ?? null,

        rack: rack ?? null,

        portCount: dto.portCount,

        usedPortCount: 0,
      });

    const savedRouter =
      await routerRepo.save(router);

    // ========================================================
    // 7. Create Router Ports
    // ========================================================

    const routerPortRepo = manager.getRepository(RouterPort);

    const ports = Array.from(
        {
          length: dto.portCount,
        },
        (_, index) =>
          routerPortRepo.create({
            routerAssetId: savedRouter.assetId,

            router: savedRouter,

            portNumber: index + 1,
          }),
      );

    await routerPortRepo.save(ports);

    // ========================================================
    // 8. Return Complete Router
    // ========================================================

    const result = await routerRepo.findOne({
        where: {
          assetId:
            savedRouter.assetId,
        },
        relations: {
          asset: {
            assetType: true,
            lifecycleStatus: true,
            condition: true,
            site: true,
          },
          rack: {
            building: {
              site: true,
            },
          },
          ports: true,
        },
      });

    if (!result) {
      throw new NotFoundException(
        `Router with ID ${savedRouter.assetId} not found after creation.`,
      );
    }

    return result;
  }
  // ========================================================
  // Find All
  // ========================================================

  async findAll(): Promise<Router[]> {
    return this.dataSource
      .getRepository(Router)
      .find({
        relations: {
          asset: {
            assetType: true,
            lifecycleStatus: true,
            condition: true,
            site: true,
          },
          rack: {
            building: {
              site: true,
            },
          },
          ports: true,
        },
        order: {
          code: 'ASC',
        },
      });
  }

  // ========================================================
  // Find By Site
  // ========================================================

  async findBySite(
    siteId: string,
  ): Promise<Router[]> {
    return this.dataSource
      .getRepository(Router)
      .find({
        where: {
          asset: {
            siteId,
          },
        },
        relations: {
          asset: {
            assetType: true,
            lifecycleStatus: true,
            condition: true,
            site: true,
          },
          rack: {
            building: {
              site: true,
            },
          },
          ports: true,
        },
        order: {
          code: 'ASC',
        },
      });
  }

  // ========================================================
  // Find One
  // ========================================================

  async findOne(
    id: string,
  ): Promise<any> {
    const routerRepo =
      this.dataSource.getRepository(Router);

    const connectionRepo =  this.dataSource.getRepository(FiberCoreRouterPortConnection);

    // --------------------------------------------------
    // 1. Find Router
    // --------------------------------------------------

    const router = await routerRepo.findOne({
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
          rack: {
            building: {
              site: true,
            },
          },
          ports: true,
        },
      });

    if (!router) {
      throw new NotFoundException(
        `Router with ID ${id} not found.`,
      );
    }

    // --------------------------------------------------
    // 2. Find Active Port Connections
    // --------------------------------------------------

    const connections = await connectionRepo.find({
        where: {
          routerPort: {
            routerAssetId: router.assetId,
          },
          status: {
            code: 'ACTIVE',
          },
        },
        relations: {
          routerPort: true,
          fiberCore: {
            fiberCable: true,
            status: true,
          },
          status: true,
        },
      });

    // --------------------------------------------------
    // 3. Map Port Status + Connection
    // --------------------------------------------------

    const connectionByPortId = new Map(
        connections.map((connection) => [
          connection.routerPortId,
          connection,
        ]),
      );

    const ports = router.ports.map((port) => {
        const connection =  connectionByPortId.get(port.id);

        if (!connection) {
          return {
            id: port.id,
            routerAssetId: port.routerAssetId,
            portNumber: port.portNumber,
            status: 'AVAILABLE',
            connection: null,
          };
        }

        return {
          id: port.id,
          routerAssetId: port.routerAssetId,
          portNumber: port.portNumber,
          status: 'USED',
          connection: {
            id: connection.id,
            fiberCoreId: connection.fiberCoreId,
            fiberCoreSide: connection.fiberCoreSide,
            status: connection.status.code,

            fiberCableId: connection.fiberCore.fiberCableId,

            coreNumber: connection.fiberCore.coreNumber,

            fiberCoreStatus: connection.fiberCore.status,
          },
        };
      });

    // --------------------------------------------------
    // 4. Return Router
    // --------------------------------------------------

    return {
      ...router,

      ports,

      portCount:
        router.portCount ?? ports.length,

      usedPortCount:
        ports.filter(
          (port) => port.status === 'USED',
        ).length,

      availablePortCount:
        ports.filter(
          (port) => port.status === 'AVAILABLE',
        ).length,
    };
  }

  // ========================================================
  // Update
  // ========================================================

  async update(
    id: string,
    dto: UpdateRouterDto,
    userId: string,
  ): Promise<Router> {
    return this.dataSource.transaction(
      async (manager) => {
        const routerRepo = manager.getRepository(Router);

        // --------------------------------------------------
        // 1. Find Router
        // --------------------------------------------------

        const router = await routerRepo.findOne({
            where: {
              assetId: id,
            },
          });

        if (!router) {
          throw new NotFoundException(
            `Router with ID ${id} not found.`,
          );
        }

        // --------------------------------------------------
        // 2. Update Asset
        // --------------------------------------------------

        await this.assetService.updateInternal(
          router.assetId,
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

        // --------------------------------------------------
        // 3. Return Updated Router
        // --------------------------------------------------

        const result = await routerRepo.findOne({
            where: {
              assetId: router.assetId,
            },
            relations: {
              asset: {
                assetType: true,
                lifecycleStatus: true,
                condition: true,
                site: true,
              },
              rack: {
                building: {
                  site: true,
                },
              },
            },
          });

        if (!result) {
          throw new NotFoundException(
            `Router with ID ${id} not found after update.`,
          );
        }

        return result;
      },
    );
  }

  // ========================================================
  // Delete
  // ========================================================


  async remove(id: string): Promise<{ message: string }> {
    const router = await this.routerRepository.findOne({
      where: { assetId: id },
    });

    if (!router) {
      throw new NotFoundException(
        `Router with Asset ID ${id} not found.`,
      );
    }

    await this.assetService.remove(id);

    return {
      message: `Router with Asset ID ${id} deleted successfully.`,
    };
  }

}