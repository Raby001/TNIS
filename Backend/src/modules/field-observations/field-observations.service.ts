import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldObservation, FieldObservationStatus } from './entities/field-observation.entity';
import { Asset } from '../assets/entities/asset.entity';
import { CreateFieldObservationDto } from './dto/create-field-observation.dto';
import { UpdateFieldObservationDto } from './dto/update-field-observation.dto';
import { FieldObservationQueryDto } from './dto/field-observation-query.dto';

@Injectable()
export class FieldObservationsService {
  constructor(
    @InjectRepository(FieldObservation)
    private readonly observationRepository: Repository<FieldObservation>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async create(
    dto: CreateFieldObservationDto,
    userId: string,
  ): Promise<FieldObservation> {
    const observation = this.observationRepository.create({
      name: dto.name,
      description: dto.description ?? null,

      geometry: dto.geometry,

      status: FieldObservationStatus.OPEN,

      createdById: userId,
      updatedById: userId,
    });

    return this.observationRepository.save(observation);
  }

  async findAll(
    query: FieldObservationQueryDto,
  ): Promise<FieldObservation[]> {
    const qb = this.observationRepository
      .createQueryBuilder('observation')
      .leftJoinAndSelect('observation.createdBy', 'createdBy')
      .leftJoinAndSelect('observation.updatedBy', 'updatedBy')
      .leftJoinAndSelect('observation.convertedAsset', 'convertedAsset');

    if (query.search) {
      qb.andWhere(
        `
        (
          observation.name ILIKE :search
          OR observation.description ILIKE :search
        )
        `,
        {
          search: `%${query.search}%`,
        },
      );
    }

    if (query.status) {
      qb.andWhere('observation.status = :status', {
        status: query.status,
      });
    }

    if (query.createdById) {
      qb.andWhere('observation.createdById = :createdById', {
        createdById: query.createdById,
      });
    }

    qb.orderBy('observation.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<FieldObservation> {
    const observation = await this.observationRepository.findOne({
      where: { id },
      relations: {
        createdBy: true,
        updatedBy: true,
        convertedAsset: {
          assetType: true,
          lifecycleStatus: true,
          condition: true,
          site: true,
        },
      },
    });

    if (!observation) {
      throw new NotFoundException(
        `Field observation with ID "${id}" not found.`,
      );
    }

    return observation;
  }

  async update(
    id: string,
    dto: UpdateFieldObservationDto,
    userId: string,
  ): Promise<FieldObservation> {
    const observation = await this.findOne(id);

    if (observation.status === FieldObservationStatus.CONVERTED) {
      throw new ConflictException(
        'A converted field observation cannot be modified.',
      );
    }

    if (observation.status === FieldObservationStatus.CANCELLED) {
      throw new ConflictException(
        'A cancelled field observation cannot be modified.',
      );
    }

    if (dto.name !== undefined) {
      observation.name = dto.name;
    }

    if (dto.description !== undefined) {
      observation.description = dto.description;
    }

    if (dto.geometry !== undefined) {
      observation.geometry = dto.geometry;
    }

    observation.updatedById = userId;

    return this.observationRepository.save(observation);
  }

  async cancel(
    id: string,
    userId: string,
  ): Promise<FieldObservation> {
    const observation = await this.findOne(id);

    if (observation.status === FieldObservationStatus.CONVERTED) {
      throw new ConflictException(
        'A converted field observation cannot be cancelled.',
      );
    }

    if (observation.status === FieldObservationStatus.CANCELLED) {
      throw new ConflictException(
        'Field observation is already cancelled.',
      );
    }

    observation.status = FieldObservationStatus.CANCELLED;
    observation.updatedById = userId;

    return this.observationRepository.save(observation);
  }

  async linkConvertedAsset(
    id: string,
    assetId: string,
    userId: string,
  ): Promise<FieldObservation> {
    const observation = await this.findOne(id);

    if (observation.status === FieldObservationStatus.CONVERTED) {
      throw new ConflictException(
        'Field observation has already been converted.',
      );
    }

    if (observation.status === FieldObservationStatus.CANCELLED) {
      throw new ConflictException(
        'A cancelled field observation cannot be converted.',
      );
    }

    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(
        `Asset with ID "${assetId}" not found.`,
      );
    }

    observation.convertedAssetId = asset.id;
    observation.status = FieldObservationStatus.CONVERTED;
    observation.updatedById = userId;

    return this.observationRepository.save(observation);
  }

  async remove(id: string): Promise<void> {
    const observation = await this.findOne(id);

    if (observation.status === FieldObservationStatus.CONVERTED) {
      throw new BadRequestException(
        'A converted field observation cannot be deleted.',
      );
    }

    await this.observationRepository.remove(observation);
  }
}