import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AssetsService } from 'src/modules/assets/assets.service';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Pole } from './entities/pole.entity';
import { CreatePoleDto } from './dto/create-pole.dto';
import { UpdatePoleDto } from './dto/update-pole.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class PolesService {
  constructor(
    @InjectRepository(Pole)
    private readonly poleRepository: Repository<Pole>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    private readonly assetsService: AssetsService,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreatePoleDto,
    userId: string,
  ): Promise<Pole> {
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
    dto: CreatePoleDto,
    userId: string,
    manager: EntityManager,
  ): Promise<Pole> {

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

        const repository = manager.getRepository(Pole);

        const pole = repository.create({
          assetId: asset.id,
          heightM: dto.heightM ?? null,
          material: dto.material ?? null,
          owner: dto.owner ?? null,
          foundation: dto.foundation ?? null,
        });

        return repository.save(pole);

  }

  async findAll(): Promise<Pole[]> {
    return this.poleRepository.find({
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

  async findOne(id: string): Promise<Pole> {
    const pole = await this.poleRepository.findOne({
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

    if (!pole) {
      throw new NotFoundException(
        `Pole with ID ${id} not found.`,
      );
    }

    return pole;
  }

  async update(
    id: string,
    dto: UpdatePoleDto,
    userId: string,
  ): Promise<Pole> {
    return this.poleRepository.manager.transaction(
      async (manager) => {
        const repository = manager.getRepository(Pole);

        const pole =
          await repository.findOne({
            where: { assetId: id },
          });

        if (!pole) {
          throw new NotFoundException(
            `Pole with ID ${id} not found.`,
          );
        }

        await this.assetsService.updateInternal(
          pole.assetId,
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

        if (dto.heightM !== undefined) {
          pole.heightM = dto.heightM;
        }

        if (dto.material !== undefined) {
          pole.material = dto.material;
        }

        if (dto.owner !== undefined) {
          pole.owner = dto.owner;
        }

        if (dto.foundation !== undefined) {
          pole.foundation = dto.foundation;
        }

        return repository.save(pole);
      },
    );
  }


  async remove(id: string): Promise<{ message: string }> {
    const pole = await this.poleRepository.findOne({
      where: { assetId: id },
    });

    if (!pole) {
      throw new NotFoundException(
        `Pole with Asset ID ${id} not found.`,
      );
    }

    await this.assetsService.remove(id);

    return {
      message: `Pole with Asset ID ${id} deleted successfully.`,
    };
  }

}