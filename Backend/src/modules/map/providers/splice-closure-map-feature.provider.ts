import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SpliceClosure } from 'src/modules/splice-closures/entities/splice-closure.entity';

import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';

@Injectable()
export class SpliceClosureMapFeatureProvider implements MapFeatureProvider {

  constructor(
    @InjectRepository(SpliceClosure)
    private readonly spliceClosureRepository: Repository<SpliceClosure>,
  ) {}

  getType(): string {
    return 'CLOSURE';
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {

    const qb = this.spliceClosureRepository
      .createQueryBuilder('spliceClosure')

      .innerJoinAndSelect(
        'spliceClosure.asset',
        'asset',
      )

      .leftJoinAndSelect(
        'asset.assetType',
        'assetType',
      )

      .leftJoinAndSelect(
        'asset.status',
        'status',
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
          OR spliceClosure.closure_type ILIKE :search
        )`,
        { search },
      );
    }

    // ========================================================
    // Location filters
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
    // Status
    // ========================================================

    if (query.statusId) {
      qb.andWhere(
        'status.id = :statusId',
        { statusId: query.statusId },
      );
    }

    if (query.limit) {
      qb.take(query.limit);
    }

    const spliceClosures = await qb.getMany();

    return spliceClosures.map((spliceClosure) => ({
      type: 'Feature',

      geometry: spliceClosure.asset.geometry,

      properties: {
        assetId: spliceClosure.assetId,

        type: 'CLOSURE',

        name: spliceClosure.asset.name,

        code: spliceClosure.asset.code,

        assetTag: spliceClosure.asset.assetTag,

        installationDate: spliceClosure.asset.installationDate ?? null,

        serialNumber: spliceClosure.asset.serialNumber,

        status: spliceClosure.asset.status?.name ?? null,

        statusId: spliceClosure.asset.status?.id ?? null,

        closureType: spliceClosure.closureType,

        capacity: spliceClosure.capacity,

        description: spliceClosure.asset.description,

        siteId: spliceClosure.asset.siteId,

        site: spliceClosure.asset.site?.name ?? null,

        city: spliceClosure.asset.site?.city?.name ?? null,

        province: spliceClosure.asset.site?.city?.province?.name ?? null,
      },
    }));
  }
}