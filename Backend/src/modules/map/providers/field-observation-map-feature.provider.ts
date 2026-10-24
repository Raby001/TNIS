import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldObservation, FieldObservationStatus } from 'src/modules/field-observations/entities/field-observation.entity';
import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';

@Injectable()
export class FieldObservationMapFeatureProvider implements MapFeatureProvider {
  constructor(
    @InjectRepository(FieldObservation)
    private readonly observationRepository: Repository<FieldObservation>,
  ) {}

  getType(): string {
    return 'FIELD_OBSERVATION';
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {

    const qb = this.observationRepository
      .createQueryBuilder('observation')
      .where('observation.geometry IS NOT NULL');

    // ========================================================
    // Search
    // ========================================================

    if (query.search) {
      const search = `%${query.search.trim()}%`;

      qb.andWhere(
        `(
          observation.name ILIKE :search
          OR observation.description ILIKE :search
        )`,
        {
          search,
        },
      );
    }

    // ========================================================
    // Only show active field observations
    // ========================================================

    qb.andWhere(
      'observation.status != :convertedStatus',
      {
        convertedStatus: FieldObservationStatus.CONVERTED,
      },
    );

    qb.andWhere(
      'observation.status != :cancelledStatus',
      {
        cancelledStatus: FieldObservationStatus.CANCELLED,
      },
    );

    // ========================================================
    // Limit
    // ========================================================

    if (query.limit) {
      qb.take(query.limit);
    }

    const observations = await qb.getMany();

    return observations.map((observation) => ({
      type: 'Feature',

      geometry: observation.geometry,

      properties: {
        id: observation.id,

        type: 'FIELD_OBSERVATION',

        name: observation.name,

        description: observation.description,

        status: observation.status,

        createdAt: observation.createdAt,

        updatedAt: observation.updatedAt,
      },
    }));
  }
}