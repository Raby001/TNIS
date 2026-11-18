import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nap } from 'src/modules/naps/entities/nap.entity';
import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';

@Injectable()
export class NapMapFeatureProvider implements MapFeatureProvider {

  constructor(
    @InjectRepository(Nap)
    private readonly napRepository: Repository<Nap>,
  ) {}

  getType(): string {
    return 'NAP';
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {

    const qb = this.napRepository
      .createQueryBuilder('nap')

      .innerJoinAndSelect(
        'nap.asset',
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
        { search },
      );
    }

    // ========================================================
    // Location
    // ========================================================

    if (query.provinceId) {
      qb.andWhere(
        'province.id = :provinceId',
        { provinceId: query.provinceId },
      );
    }

    if (query.cityId) {
      qb.andWhere(
        'city.id = :cityId',
        { cityId: query.cityId },
      );
    }

    if (query.siteId) {
      qb.andWhere(
        'site.id = :siteId',
        { siteId: query.siteId },
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

    if (query.limit) {
      qb.take(query.limit);
    }

    const naps = await qb.getMany();

    return naps.map((nap) => ({
      type: 'Feature',

      geometry: nap.asset.geometry,

      properties: {

        assetId: nap.assetId,

        assetTypeId: nap.asset.assetType?.id ?? null, 

        type: 'NAP',

        name: nap.asset.name,

        capacity: nap.capacity,

        code: nap.asset.code,

        assetTag: nap.asset.assetTag,

        serialNumber: nap.asset.serialNumber,

        installationDate: nap.asset.installationDate ?? null,

        lifecycleStatusId: nap.asset.lifecycleStatus?.id ?? null, 
        lifecycleStatus: nap.asset.lifecycleStatus?.name ?? null,

        condition: nap.asset.condition?.name ?? null,
        conditionId: nap.asset.condition?.id ?? null,

        manufacturer: nap.asset.manufacturer,
        model: nap.asset.model,

        description: nap.asset.description,

        siteId: nap.asset.siteId,

        site: nap.asset.site?.name ?? null,

        city: nap.asset.site?.city?.name ?? null,

        province: nap.asset.site?.city?.province?.name ?? null,
      },
    }));
  }
}