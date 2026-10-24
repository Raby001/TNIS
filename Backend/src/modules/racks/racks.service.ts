import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Rack } from './entities/rack.entity';
import { Building } from '../buildings/entities/building.entity';
import { Asset } from '../assets/entities/asset.entity';
import { AssetType } from '../assets/entities/asset-type.entity';
import { Status } from '../assets/entities/status.entity';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class RacksService {

  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Rack)
    private readonly rackRepository: Repository<Rack>,

    private readonly assetsService: AssetsService,
  ) {}

  // ========================================================
  // Create
  // ========================================================
  async create(
    dto: CreateRackDto,
    userId: string,
  ): Promise<Rack> {
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
    dto: CreateRackDto,
    userId: string,
    manager: EntityManager,
  ): Promise<Rack> {

        const rackRepo = manager.getRepository(Rack);

        const buildingRepo = manager.getRepository(Building);

        const assetTypeRepo = manager.getRepository(AssetType);

        const statusRepo = manager.getRepository(Status);

        // --------------------------------------------------
        // 1. Find Building
        // --------------------------------------------------

        const building =
          await buildingRepo.findOne({
            where: {
              id: dto.buildingId,
            },
            relations: {
              site: true,
            },
          });

        if (!building) {
          throw new NotFoundException(
            `Building with ID ${dto.buildingId} not found.`,
          );
        }

        // --------------------------------------------------
        // 2. Find Asset Type
        // --------------------------------------------------

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

        // --------------------------------------------------
        // 3. Find Status
        // --------------------------------------------------

        const status =
          await statusRepo.findOne({
            where: {
              id: dto.statusId,
            },
          });

        if (!status) {
          throw new NotFoundException(
            `Status with ID ${dto.statusId} not found.`,
          );
        }

        // --------------------------------------------------
        // 4. Generate Rack structural code
        // --------------------------------------------------

        const existingRacks = await rackRepo.find({
            where: {
              buildingId: building.id,
            },
            select: {
              code: true,
            },
          });

        const rackNumbers = existingRacks
            .map((rack) => {
              const match =  rack.code.match(/\.RCK(\d+)$/);

              return match
                ? Number(match[1])
                : 0;
            });

        const nextRackNumber = Math.max(0, ...rackNumbers) + 1;

        const rackCode = `${building.code}.${assetType.qualifier}${String(
            nextRackNumber,
          ).padStart(2, '0')}`;

        // --------------------------------------------------
        // 5. Create Asset through AssetsService
        // --------------------------------------------------

        const asset = await this.assetsService.createInternal(
            {
              name: dto.name,
              description: dto.description,

              assetTypeId: dto.assetTypeId,
              statusId: dto.statusId,
              siteId: building.site.id,

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

        // --------------------------------------------------
        // 6. Create Rack
        // --------------------------------------------------

        const rack = rackRepo.create({
            code: rackCode,

            assetId: asset.id,
            asset,

            buildingId: building.id,
            building,
          });

        await rackRepo.save(rack);

        // --------------------------------------------------
        // 7. Return
        // --------------------------------------------------

        const result = await rackRepo.findOne({
            where: {
              assetId: rack.assetId,
            },
            relations: {
              asset: {
                assetType: true,
                status: true,
                site: true,
              },
              building: {
                site: true,
              },
              routers: true,
            },
          });

        if (!result) {
          throw new NotFoundException(
            `Rack with ID ${rack.assetId} not found after creation.`,
          );
        }

        return result;

  }

  // ========================================================
  // Find All
  // ========================================================

  async findAll(): Promise<Rack[]> {

    return this.rackRepository.find({
      relations: {
        asset: {
          assetType: true,
          status: true,
          site: true,
        },
        building: {
          site: true,
        },
        routers: true,
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
  ): Promise<Rack> {

    const rack =
      await this.rackRepository.findOne({
        where: {
          assetId: id,
        },
        relations: {
          asset: {
            assetType: true,
            status: true,
            site: true,
            createdBy: true,
            updatedBy: true,
          },
          building: {
            site: true,
          },
          routers: true,
        },
      });

    if (!rack) {
      throw new NotFoundException(
        `Rack with ID ${id} not found.`,
      );
    }

    return rack;
  }

  // ========================================================
  // Update
  // ========================================================

  async update(
    id: string,
    dto: UpdateRackDto,
    userId: string,
  ): Promise<Rack> {

    return this.dataSource.transaction(
      async (manager) => {

        const rackRepo = manager.getRepository(Rack);

        const rack = await rackRepo.findOne({
            where: {
              assetId: id,
            },
            relations: {
              asset: {
                assetType: true,
                status: true,
              },
              building: {
                site: true,
              },
            },
          });

        if (!rack) {
          throw new NotFoundException(
            `Rack with ID ${id} not found.`,
          );
        }

        // --------------------------------------------------
        // Update Asset through AssetsService
        // --------------------------------------------------

        await this.assetsService.updateInternal(
          rack.assetId,
          {
            name: dto.name,
            description: dto.description,
            assetTag: dto.assetTag,
            serialNumber: dto.serialNumber,
            
            purchaseDate: dto.purchaseDate,
            installationDate: dto.installationDate,

            warrantyStart: dto.warrantyStart,
            warrantyEnd: dto.warrantyEnd,

            statusId: dto.statusId,
          },
          userId,
          manager,
        );

        // --------------------------------------------------
        // Return updated Rack
        // --------------------------------------------------

        const result =
          await rackRepo.findOne({
            where: {
              assetId: rack.assetId,
            },
            relations: {
              asset: {
                assetType: true,
                status: true,
                site: true,
              },
              building: {
                site: true,
              },
              routers: true,
            },
          });

        if (!result) {
          throw new NotFoundException(
            `Rack with ID ${id} not found after update.`,
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
    const rack = await this.rackRepository.findOne({
      where: { assetId: id },
    });

    if (!rack) {
      throw new NotFoundException(
        `Rack with Asset ID ${id} not found.`,
      );
    }

    await this.assetsService.remove(id);

    return {
      message: `Rack with Asset ID ${id} deleted successfully.`,
    };
  }

}