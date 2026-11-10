import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AssetsService } from 'src/modules/assets/assets.service';
import { Handhole } from './entities/handhole.entity';
import { CreateHandholeDto } from './dto/create-handhole.dto';
import { UpdateHandholeDto } from './dto/update-handhole.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class HandholesService {
  constructor(
    @InjectRepository(Handhole)
    private readonly handholeRepository: Repository<Handhole>,

    private readonly assetsService: AssetsService,

    private readonly dataSource: DataSource,
    
  ) {}

  async create(
    dto: CreateHandholeDto,
    userId: string,
  ): Promise<Handhole> {
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
    dto: CreateHandholeDto,
    userId: string,
    manager: EntityManager,
  ): Promise<Handhole> {

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

        const repository = manager.getRepository(Handhole);

        const handhole = repository.create({
          assetId: asset.id,
          size: dto.size ?? null,
          material: dto.material ?? null,
          coverType: dto.coverType ?? null,
        });

        return repository.save(handhole);

  }

  async findAll(): Promise<Handhole[]> {
    return this.handholeRepository.find({
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

  async findOne(assetId: string): Promise<Handhole> {
    const handhole =  await this.handholeRepository.findOne({
        where: { assetId },
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

    if (!handhole) {
      throw new NotFoundException(
        `Handhole with ID ${assetId} not found.`,
      );
    }

    return handhole;
  }

  async update(
    assetId: string,
    dto: UpdateHandholeDto,
    userId: string,
  ): Promise<Handhole> {
    return this.handholeRepository.manager.transaction(
      async (manager) => {
        const repository = manager.getRepository(Handhole);

        const handhole = await repository.findOne({
            where: { assetId },
          });

        if (!handhole) {
          throw new NotFoundException(
            `Handhole with ID ${assetId} not found.`,
          );
        }

        await this.assetsService.updateInternal(
          handhole.assetId,
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

        if (dto.size !== undefined) {
          handhole.size = dto.size;
        }

        if (dto.material !== undefined) {
          handhole.material = dto.material;
        }

        if (dto.coverType !== undefined) {
          handhole.coverType = dto.coverType;
        }

        return repository.save(handhole);
      },
    );
  }

  async remove(assetId: string): Promise<{message: string}> {
    const handhole = await this.handholeRepository.findOne({
        where: { assetId },
      });

    if (!handhole) {
      throw new NotFoundException(
        `Handhole with ID ${assetId} not found.`,
      );
    }

    await this.assetsService.remove(assetId);

    return {
      message: `Hanhole with Asset ID ${assetId} deleted successfully.`,
    }

  }
}