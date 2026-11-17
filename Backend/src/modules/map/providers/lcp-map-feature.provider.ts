import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lcp } from 'src/modules/lcps/entities/lcp.entity';
import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';

@Injectable()
export class LcpMapFeatureProvider
  implements MapFeatureProvider
{
  constructor(
    @InjectRepository(Lcp)
    private readonly lcpRepository: Repository<Lcp>,
  ) {}

  getType(): string {
    return 'LCP';
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {

    const qb = this.lcpRepository
      .createQueryBuilder('lcp')

      .innerJoinAndSelect(
        'lcp.asset',
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


    // ========================================================
    // Execute
    // ========================================================

    const lcps = await qb.getMany();


    // ========================================================
    // Convert to Map Features
    // ========================================================

    return lcps.map((lcp) => ({
      type: 'Feature',

      geometry: lcp.asset.geometry,

      properties: {

        // ============================================
        // Asset
        // ============================================

        id: lcp.assetId,

        assetId: lcp.assetId,

        type: 'LCP',

        name: lcp.asset.name,

        code: lcp.asset.code,

        assetTag: lcp.asset.assetTag,

        serialNumber: lcp.asset.serialNumber,

        description: lcp.asset.description,

        installationDate: lcp.asset.installationDate ?? null,

        // ============================================
        // Status
        // ============================================
        lifecycleStatusId: lcp.asset.lifecycleStatus?.id ?? null, 
        lifecycleStatus: lcp.asset.lifecycleStatus?.name ?? null,

        condition: lcp.asset.condition?.name ?? null,
        conditionId: lcp.asset.condition?.id ?? null,

        manufacturer: lcp.asset.manufacturer,
        model: lcp.asset.model,

        // ============================================
        // LCP Information
        // ============================================

        splitterCapacity: lcp.splitterCapacity ?? null,


        // ============================================
        // Location
        // ============================================

        siteId: lcp.asset.siteId ?? null,

        cityId: lcp.asset.site?.city?.id ?? null,

        provinceId: lcp.asset.site?.city?.province?.id ?? null,
      },
    }));
  }
}