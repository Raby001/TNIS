import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Handhole } from 'src/modules/handholes/entities/handhole.entity';
import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';

@Injectable()
export class HandholeMapFeatureProvider implements MapFeatureProvider {

  constructor(
    @InjectRepository(Handhole)
    private readonly handholeRepository: Repository<Handhole>,
  ) {}

  getType(): string {
    return 'HANDHOLE';
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {
    const qb = this.handholeRepository
      .createQueryBuilder('handhole')

      .innerJoinAndSelect(
        'handhole.asset',
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

      .leftJoin(
        'city.province',
        'province',
      )
      .addSelect('province.id')
      .where('asset.geometry IS NOT NULL');

    // ========================================================
    // Search
    // ========================================================

    if (query.search) {
      const search = `%${query.search.trim()}%`;

      qb.andWhere(
        `(
          asset.name ILIKE :search
          OR asset.code ILIKE :search
          OR asset.asset_tag ILIKE :search
          OR asset.serial_number ILIKE :search
          OR handhole.size ILIKE :search
          OR handhole.material ILIKE :search
          OR handhole.cover_type ILIKE :search
        )`,
        { search },
      );
    }

    // ========================================================
    // Location
    // ========================================================

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

    // ========================================================
    // Limit
    // ========================================================

    if (query.limit) {
      qb.take(query.limit);
    }

    const handholes = await qb.getMany();

    // ========================================================
    // GeoJSON Features
    // ========================================================

    return handholes.map((handhole) => ({
      type: 'Feature',

      geometry: handhole.asset.geometry,

      properties: {
        // Handhole
        assetId: handhole.assetId,
        assetTypeId: handhole.asset.assetType?.id ?? null, 
        type: 'HANDHOLE',

        // Common Asset information
        name: handhole.asset.name,
        code: handhole.asset.code,
        assetTag: handhole.asset.assetTag,
        serialNumber: handhole.asset.serialNumber,
        description: handhole.asset.description,

        // ============================================
        // Lifecycle Status
        // ============================================

        lifecycleStatusId: handhole.asset.lifecycleStatus?.id ?? null, 
        lifecycleStatus: handhole.asset.lifecycleStatus?.name ?? null,

        condition: handhole.asset.condition?.name ?? null,
        conditionId: handhole.asset.condition?.id ?? null,

        manufacturer: handhole.asset.manufacturer,
        model: handhole.asset.model,

        // Handhole-specific information
        size: handhole.size,
        material: handhole.material,
        coverType: handhole.coverType,

        // Location
        siteId: handhole.asset.siteId,

        site: handhole.asset.site?.name ?? null,

        city: handhole.asset.site?.city?.name ?? null,

        installationDate: handhole.asset.installationDate ?? null,

        province: handhole.asset.site?.city?.province?.name ?? null,
      },
    }));
  }
}