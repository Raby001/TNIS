import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Occ } from 'src/modules/occs/entities/occ.entity';
import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';

@Injectable()
export class OccMapFeatureProvider implements MapFeatureProvider{
  constructor(
    @InjectRepository(Occ)
    private readonly occRepository: Repository<Occ>,
  ) {}

  getType(): string {
    return 'OCC';
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {

    const qb = this.occRepository
      .createQueryBuilder('occ')

      .innerJoinAndSelect(
        'occ.asset',
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

      .where(
        'asset.geometry IS NOT NULL',
      );

    // ========================================================
    // Search
    // ========================================================

    if (query.search) {
      const search =
        `%${query.search.trim()}%`;

      qb.andWhere(
        `(
          asset.name ILIKE :search
          OR asset.code ILIKE :search
          OR asset.asset_tag ILIKE :search
          OR asset.serial_number ILIKE :search
          OR asset.description ILIKE :search
        )`,
        {
          search,
        },
      );
    }

    // ========================================================
    // Province
    // ========================================================

    if (query.provinceId) {
      qb.andWhere(
        'province.id = :provinceId',
        {
          provinceId: query.provinceId,
        },
      );
    }

    // ========================================================
    // City
    // ========================================================

    if (query.cityId) {
      qb.andWhere(
        'city.id = :cityId',
        {
          cityId: query.cityId,
        },
      );
    }

    // ========================================================
    // Site
    // ========================================================

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

    const occs = await qb.getMany();

    // ========================================================
    // GeoJSON Features
    // ========================================================

    return occs.map((occ) => ({
      type: 'Feature',

      geometry: occ.asset.geometry,

      properties: {
        // OCC
        assetId: occ.assetId,
        type: 'OCC',
        
        // Common Asset information
        name: occ.asset.name,
        code: occ.asset.code,
        assetTag: occ.asset.assetTag,
        serialNumber: occ.asset.serialNumber,
        description: occ.asset.description,

        // Asset Type
        assetTypeId: occ.asset.assetType?.id ?? null,

        assetType: occ.asset.assetType?.name ?? null,

        lifecycleStatusId: occ.asset.lifecycleStatus?.id ?? null, 
        lifecycleStatus: occ.asset.lifecycleStatus?.name ?? null,

        condition: occ.asset.condition?.name ?? null,
        conditionId: occ.asset.condition?.id ?? null,

        manufacturer: occ.asset.manufacturer,
        model: occ.asset.model,

        // OCC-specific information
        portCount: occ.portCount ?? null,
        
        usedPortCount: occ.usedPortCount ?? null,

        // Location
        siteId: occ.asset.siteId,

        site: occ.asset.site?.name ?? null,

        city: occ.asset.site?.city?.name ?? null,

        cityId: occ.asset.site?.city?.id ?? null,

        province: occ.asset.site?.city?.province?.name ?? null,

        provinceId: occ.asset.site?.city?.province?.id ?? null,

        // Lifecycle
        installationDate: occ.asset.installationDate ?? null,
      },
    }));
  }
}