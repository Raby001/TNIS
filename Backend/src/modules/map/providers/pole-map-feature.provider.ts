import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pole } from 'src/modules/poles/entities/pole.entity';
import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';

@Injectable()
export class PoleMapFeatureProvider implements MapFeatureProvider {
  constructor(
    @InjectRepository(Pole)
    private readonly poleRepository: Repository<Pole>,
  ) {}

  getType(): string {
    return 'POLE';
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {
    const qb = this.poleRepository
      .createQueryBuilder('pole')

      .innerJoinAndSelect(
        'pole.asset',
        'asset',
      )

      .leftJoinAndSelect(
        'asset.assetType',
        'assetType',
      )

      .leftJoinAndSelect(
        'asset.lifecycleStatus',
        'lifecycleStatus',
      )

      .leftJoinAndSelect(
        'asset.condition',
        'condition',
      )

      .leftJoinAndSelect(
        'asset.site',
        'site',
      )

      .leftJoinAndSelect(
        'site.city',
        'city',
      )

      .leftJoinAndSelect(
        'city.province',
        'province',
      )

      .where('asset.geometry IS NOT NULL');

    // --------------------------------------------------
    // Common Filters
    // --------------------------------------------------

    if (query.search) {
      const search = `%${query.search.trim()}%`;

      qb.andWhere(
        `(
          asset.name ILIKE :search
          OR asset.code ILIKE :search
          OR asset.asset_tag ILIKE :search
          OR asset.serial_number ILIKE :search
          OR pole.material ILIKE :search
          OR pole.owner ILIKE :search
          OR pole.foundation ILIKE :search
        )`,
        { search },
      );
    }

    if (query.provinceId) {
      qb.andWhere(
        'province.id = :provinceId',
        {
          provinceId: query.provinceId,
        },
      );
    }

    if (query.cityId) {
      qb.andWhere(
        'city.id = :cityId',
        {
          cityId: query.cityId,
        },
      );
    }

    if (query.siteId) {
      qb.andWhere(
        'site.id = :siteId',
        {
          siteId: query.siteId,
        },
      );
    }

    // ========================================================
    // Lifecycle Status
    // ========================================================

    if (query.lifecycleStatusId) {
      qb.andWhere(
        'lifecycleStatus.id = :lifecycleStatusId',
        {
          lifecycleStatusId: query.lifecycleStatusId,
        },
      );
    }


    // ========================================================
    // Asset Condition
    // ========================================================

    if (query.conditionId) {
      qb.andWhere(
        'condition.id = :conditionId',
        {
          conditionId: query.conditionId,
        },
      );
    }

    // --------------------------------------------------
    // Limit
    // --------------------------------------------------

    if (query.limit) {
      qb.take(query.limit);
    }

    const poles = await qb.getMany();

    // --------------------------------------------------
    // GeoJSON Features
    // --------------------------------------------------

    return poles.map((pole) => ({
      type: 'Feature',

      geometry: pole.asset.geometry,

      properties: {
        // Pole
        assetId: pole.assetId,
        type: 'POLE',

        // Common Asset information
        name: pole.asset.name,
        code: pole.asset.code,
        assetTag: pole.asset.assetTag,
        serialNumber: pole.asset.serialNumber,
        description: pole.asset.description,
        installationDate: pole.asset.installationDate ?? null,

        // Status
        lifecycleStatusId: pole.asset.lifecycleStatus?.id ?? null, 
        lifecycleStatus: pole.asset.lifecycleStatus?.name ?? null,

        condition: pole.asset.condition?.name ?? null,
        conditionId: pole.asset.condition?.id ?? null,

        manufacturer: pole.asset.manufacturer,
        model: pole.asset.model,

        // Pole-specific information
        heightM: pole.heightM,
        material: pole.material,
        owner: pole.owner,
        foundation: pole.foundation,

        // Location
        siteId: pole.asset.siteId,

        site: pole.asset.site?.name ?? null,

        city: pole.asset.site?.city?.name ?? null,

        province: pole.asset.site?.city?.province?.name ?? null,
      },
    }));
  }
}