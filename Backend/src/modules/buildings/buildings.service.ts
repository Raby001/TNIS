import { Injectable, NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import { Site } from '../sites/entities/site.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingsService {

  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,

    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  // ========================================================
  // Create
  // ========================================================

  async create(
    dto: CreateBuildingDto,
  ): Promise<Building> {

    const site = await this.siteRepository.findOne({
        where: {
          id: dto.siteId,
        },
      });

    if (!site) {
      throw new NotFoundException(
        `Site with ID ${dto.siteId} not found.`,
      );
    }

    const existingBuildings = await this.buildingRepository.count({
        where: {
          siteId: site.id,
        },
      });

    const buildingNumber = existingBuildings + 1;

    const code = `${site.code}.BLD${String(buildingNumber).padStart(2, '0')}`;

    const building = this.buildingRepository.create({
        code,
        name: dto.name,
        description: dto.description ?? null,
        siteId: site.id,
        site,
      });

    return this.buildingRepository.save(building);
  }

  // ========================================================
  // Find All
  // ========================================================

  async findAll(): Promise<Building[]> {

    return this.buildingRepository.find({
      relations: {
        site: true,
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
  ): Promise<Building> {

    const building = await this.buildingRepository.findOne({
        where: {
          id,
        },
        relations: {
          site: true,
          racks: true,
        },
      });

    if (!building) {
      throw new NotFoundException(
        `Building with ID ${id} not found.`,
      );
    }

    return building;
  }

  // ========================================================
  // Update
  // ========================================================

  async update(
    id: string,
    dto: UpdateBuildingDto,
  ): Promise<Building> {
    const building = await this.buildingRepository.findOne({
      where: {
        id,
      },
    });

    if (!building) {
      throw new NotFoundException(
        `Building with ID ${id} not found.`,
      );
    }

    if (dto.name !== undefined) {
      building.name = dto.name;
    }

    if (dto.description !== undefined) {
      building.description = dto.description;
    }

    return this.buildingRepository.save(building);
  }

  // ========================================================
  // Delete
  // ========================================================

  async remove(
    id: string,
  ): Promise<void> {

    const building = await this.buildingRepository.findOne({
        where: {
          id,
        },
      });

    if (!building) {
      throw new NotFoundException(
        `Building with ID ${id} not found.`,
      );
    }

    await this.buildingRepository.remove(building);
  }
}