import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tower } from 'src/modules/towers/entities/tower.entity';

import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';

@Injectable()
export class TowerMapFeatureProvider
  implements MapFeatureProvider {

  constructor(
    @InjectRepository(Tower)
    private readonly towerRepository: Repository<Tower>,
  ) {}

  getType(): string {
    return 'TOWER';
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {

    const qb = this.towerRepository
      .createQueryBuilder('tower')
      .innerJoinAndSelect('tower.asset', 'asset')
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

    // Search
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

    // Province
    if (query.provinceId) {
      qb.andWhere(
        'province.id = :provinceId',
        {
          provinceId: query.provinceId,
        },
      );
    }

    // City
    if (query.cityId) {
      qb.andWhere(
        'city.id = :cityId',
        {
          cityId: query.cityId,
        },
      );
    }

    // Site
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

    if (query.limit) {
      qb.take(query.limit);
    }

    const towers = await qb.getMany();

    return towers.map((tower) => ({
      type: 'Feature',

      geometry: tower.asset.geometry,

      properties: {

        assetId: tower.assetId,

        type: 'TOWER',

        name: tower.asset.name,

        code: tower.asset.code,

        assetTag: tower.asset.assetTag,

        serialNumber: tower.asset.serialNumber,

        lifecycleStatusId: tower.asset.lifecycleStatus?.id ?? null, 
        lifecycleStatus: tower.asset.lifecycleStatus?.name ?? null,

        condition: tower.asset.condition?.name ?? null,
        conditionId: tower.asset.condition?.id ?? null,

        manufacturer: tower.asset.manufacturer,
        model: tower.asset.model,

        assetType: tower.asset.assetType?.name ?? null,

        installationDate: tower.asset.installationDate ?? null,

        description: tower.asset.description ?? null,

        heightM: tower.heightM,

        owner: tower.owner,

        foundation: tower.foundation,

        maximumLoad: tower.maximumLoad,

        occupiedSpace: tower.occupiedSpace,

        availableSpace: tower.availableSpace,

        power: tower.power,

        gps: tower.gps,

        battery: tower.battery,

        generator: tower.generator,

        leaseExpiry: tower.leaseExpiry,

        siteId: tower.asset.siteId,

        site: tower.asset.site?.name ?? null,

        city: tower.asset.site?.city?.name ?? null,

        province: tower.asset.site?.city?.province?.name ?? null,
      },
    }));
  }
}