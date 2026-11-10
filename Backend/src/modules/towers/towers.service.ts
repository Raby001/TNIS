import { DataSource, EntityManager, Repository } from "typeorm";
import { CreateTowerDto } from "./dto/create-tower.dto";
import { Tower } from "./entities/tower.entity";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Asset } from "../assets/entities/asset.entity";
import { AssetType } from "../assets/entities/asset-type.entity";
import { UpdateTowerDto } from "./dto/update-tower.dto";
import { AssetsService } from "../assets/assets.service";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class TowersService {

  constructor(

    @InjectRepository(Tower)
    private readonly TowerRepository: Repository<Tower>,
    private readonly dataSource: DataSource,
    private readonly assetService: AssetsService,
  ){}


  // ==================================================
  // Create
  // ==================================================

  async create(
    dto: CreateTowerDto,
    userId: string,
  ): Promise<Tower> {
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
    dto: CreateTowerDto,
    userId: string, 
    manager: EntityManager,
  ): Promise<Tower> {

        const towerRepo = manager.getRepository(Tower);

        // ---------------------------------------------
        // 1. Validate Asset Type
        // ---------------------------------------------

        const assetTypeRepo = manager.getRepository(AssetType);

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

        if (
          assetType.qualifier
            .trim()
            .toUpperCase() !== 'TW'
        ) {
          throw new BadRequestException(
            `Asset type "${assetType.name}" is not a Tower asset type.`,
          );
        }

        // ---------------------------------------------
        // 2. Create Asset
        // ---------------------------------------------

        const asset =
          await this.assetService.createInternal(
            {
              name: dto.name,
              siteId: dto.siteId,
              assetTypeId: dto.assetTypeId,
              manufacturer: dto.manufacturer,
              model: dto.model,
              lifecycleStatusId: dto.lifecycleStatusId,
              conditionId: dto.conditionId,

              assetTag: dto.assetTag,
              serialNumber: dto.serialNumber,

              description: dto.description,

              geometry: dto.geometry,

              purchaseDate: dto.purchaseDate,
              installationDate: dto.installationDate,
              warrantyStart: dto.warrantyStart,
              warrantyEnd: dto.warrantyEnd,
            },
            userId,
            manager,
          );

        // ---------------------------------------------
        // 3. Create Tower
        // ---------------------------------------------

        const tower = towerRepo.create({
            assetId: asset.id,
            asset,

            heightM: dto.heightM ?? null,
            owner: dto.owner ?? null,
            foundation: dto.foundation ?? null,

            maximumLoad: dto.maximumLoad ?? null,

            occupiedSpace: dto.occupiedSpace ?? null,

            availableSpace: dto.availableSpace ?? null,

            power: dto.power ?? null,

            generator: dto.generator ?? false,

            battery: dto.battery ?? false,

            gps: dto.gps ?? false,

            leaseExpiry: dto.leaseExpiry ? new Date(dto.leaseExpiry) : null,
          });

        const savedTower = await towerRepo.save(tower);

        // ---------------------------------------------
        // 4. Return complete Tower
        // ---------------------------------------------

        const result = await towerRepo.findOne({
            where: {
              assetId: savedTower.assetId,
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
            `Tower with ID ${savedTower.assetId} not found after creation.`,
          );
        }

        return result;
  }

  // ========================================================
  // Find All
  // ========================================================

  async findAll(): Promise<Tower[]> {
    
    const towerRepo = this.dataSource.getRepository(Tower);

    return towerRepo.find({
        relations: {
          asset: {
            assetType: true,
            lifecycleStatus: true,
            condition: true,
          },
        },
        order: {
          asset: {
            createdAt: 'DESC',
          },
        },
      });
  }

  // ========================================================
  // Find One
  // ========================================================

  async findOne( id: string,): Promise<Tower> {

    const towerRepo = this.dataSource.getRepository(Tower);

    const tower = await towerRepo.findOne({
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
        },
      });

    if (!tower) {
      throw new NotFoundException(
        `Tower with ID ${id} not found.`,
      );
    }

    return tower;
  }

  // ========================================================
  // Update
  // ========================================================

  async update(
    id: string,
    dto: UpdateTowerDto,
    userId: string
  ): Promise<Tower> {

    return this.dataSource.transaction(
      async (manager) => {

        const towerRepo = manager.getRepository(Tower);

        // ---------------------------------------------
        // 1. Find Tower
        // ---------------------------------------------

        const tower = await towerRepo.findOne({
            where: {
              assetId: id,
            },
          });

        if (!tower) {
          throw new NotFoundException(
            `Tower with ID ${id} not found.`,
          );
        }

        // ---------------------------------------------
        // 2. Update Asset
        // ---------------------------------------------

        await this.assetService.updateInternal(
          tower.assetId,
          {
            name: dto.name,
            manufacturer: dto.manufacturer,
            model: dto.model,
            lifecycleStatusId: dto.lifecycleStatusId,
            conditionId: dto.conditionId,
            assetTag: dto.assetTag,
            serialNumber: dto.serialNumber,

            description: dto.description,

            geometry: dto.geometry,

            purchaseDate: dto.purchaseDate,
            installationDate: dto.installationDate,
            warrantyStart: dto.warrantyStart,
            warrantyEnd: dto.warrantyEnd,
          },
          userId,
          manager,
        );

        // ---------------------------------------------
        // 3. Update Tower-specific fields
        // ---------------------------------------------

        if (dto.heightM !== undefined) {
          tower.heightM = dto.heightM;
        }

        if (dto.owner !== undefined) {
          tower.owner = dto.owner;
        }

        if (dto.foundation !== undefined) {
          tower.foundation = dto.foundation;
        }

        if (dto.maximumLoad !== undefined) {
          tower.maximumLoad = dto.maximumLoad;
        }

        if (dto.occupiedSpace !== undefined) {
          tower.occupiedSpace = dto.occupiedSpace;
        }

        if (dto.availableSpace !== undefined) {
          tower.availableSpace = dto.availableSpace;
        }

        if (dto.power !== undefined) {
          tower.power = dto.power;
        }

        if (dto.generator !== undefined) {
          tower.generator = dto.generator;
        }

        if (dto.battery !== undefined) {
          tower.battery = dto.battery;
        }

        if (dto.gps !== undefined) {
          tower.gps = dto.gps;
        }

        if (dto.leaseExpiry !== undefined) {
          tower.leaseExpiry = new Date(dto.leaseExpiry);
        }

        // ---------------------------------------------
        // 4. Save Tower
        // ---------------------------------------------

        await towerRepo.save(tower);

        // ---------------------------------------------
        // 5. Return complete Tower
        // ---------------------------------------------

        const result =
          await towerRepo.findOne({
            where: {
              assetId: tower.assetId,
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
            `Tower with ID ${id} not found after update.`,
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
    const tower = await this.TowerRepository.findOne({
      where: { assetId: id },
    });

    if (!tower) {
      throw new NotFoundException(
        `Tower with Asset ID ${id} not found.`,
      );
    }

    await this.assetService.remove(id);

    return {
      message: `Tower with Asset ID ${id} deleted successfully.`,
    };
  }



}