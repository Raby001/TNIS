import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AssetsService } from 'src/modules/assets/assets.service';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Manhole } from './entities/manhole.entity';
import { CreateManholeDto } from './dto/create-manhole.dto';
import { UpdateManholeDto } from './dto/update-manhole.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class ManholesService {
  constructor(
    @InjectRepository(Manhole)
    private readonly manholeRepository: Repository<Manhole>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    private readonly assetsService: AssetsService,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateManholeDto,
    userId: string,
  ): Promise<Manhole> {
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
    dto: CreateManholeDto,
    userId: string,
    manager: EntityManager,
  ): Promise<Manhole> {

        const asset = await this.assetsService.createInternal(
            {
              name: dto.name,
              description: dto.description,
              assetTypeId: dto.assetTypeId,
              manufacturer: dto.manufacturer,
              model: dto.model,
              lifecycleStatusId: dto.lifecycleStatusId,
              conditionId: dto.conditionId,
              siteId: dto.siteId,
              assetTag: dto.assetTag,
              serialNumber: dto.serialNumber,
              purchaseDate: dto.purchaseDate,
              installationDate: dto.installationDate,
              warrantyStart: dto.warrantyStart,
              warrantyEnd: dto.warrantyEnd,
              geometry: dto.geometry,
            },
            userId,
            manager,
          );

        const manholeRepository = manager.getRepository(Manhole);

        const manhole = manholeRepository.create({
          assetId: asset.id,
          depthM: dto.depthM ?? null,
          material: dto.material ?? null,
          coverType: dto.coverType ?? null,
        });

        return manholeRepository.save(manhole);

  }

  async findAll(): Promise<Manhole[]> {
    return this.manholeRepository.find({
      relations: {
        asset: {
          assetType: true,
          lifecycleStatus: true,
          condition: true,
          site: true,
        },
      },
    });
  }

  async findOne(id: string): Promise<Manhole> {
    const manhole = await this.manholeRepository.findOne({
        where: { assetId: id },
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

    if (!manhole) {
      throw new NotFoundException(
        `Manhole with ID ${id} not found.`,
      );
    }

    return manhole;
  }

  async update(
    id: string,
    dto: UpdateManholeDto,
    userId: string,
  ): Promise<Manhole> {
    return this.manholeRepository.manager.transaction(
      async (manager) => {
        const manholeRepository = manager.getRepository(Manhole);

        const manhole = await manholeRepository.findOne({
            where: { assetId: id },
          });

        if (!manhole) {
          throw new NotFoundException(
            `Manhole with ID ${id} not found.`,
          );
        }

        await this.assetsService.updateInternal(
          manhole.assetId,
          {
            name: dto.name,
            description: dto.description,
            manufacturer: dto.manufacturer,
            model: dto.model,
            lifecycleStatusId: dto.lifecycleStatusId,
            conditionId: dto.conditionId,
            assetTag: dto.assetTag,
            serialNumber: dto.serialNumber,
            purchaseDate: dto.purchaseDate,
            installationDate: dto.installationDate,
            warrantyStart: dto.warrantyStart,
            warrantyEnd: dto.warrantyEnd,
            geometry: dto.geometry,
          },
          userId,
          manager,
        );

        if (dto.depthM !== undefined) {
          manhole.depthM = dto.depthM;
        }

        if (dto.material !== undefined) {
          manhole.material = dto.material;
        }

        if (dto.coverType !== undefined) {
          manhole.coverType = dto.coverType;
        }

        return manholeRepository.save(manhole);
      },
    );
  }

  async remove(assetId: string): Promise<{ message: string }> {
    const manhole = await this.manholeRepository.findOne({
        where: { assetId: assetId },
      });

    if (!manhole) {
      throw new NotFoundException(
        `Manhole with ID ${assetId} not found.`,
      );
    }

    await this.assetsService.remove(manhole.assetId);

    return {
      message: `Handhole with Asset ID ${assetId} deleted successfully.`,
    };    
  }
}