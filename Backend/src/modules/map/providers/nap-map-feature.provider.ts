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

    const naps = await qb.getMany();

    return naps.map((nap) => ({
      type: 'Feature',

      geometry: nap.asset.geometry,

      properties: {

        assetId: nap.assetId,

        type: 'NAP',

        name: nap.asset.name,

        capacity: nap.capacity,

        code: nap.asset.code,

        assetTag: nap.asset.assetTag,

        serialNumber: nap.asset.serialNumber,

        status: nap.asset.status?.name ?? null,

        installationDate: nap.asset.installationDate ?? null,

        statusId: nap.asset.status?.id ?? null,

        description: nap.asset.description,

        siteId: nap.asset.siteId,

        site: nap.asset.site?.name ?? null,

        city: nap.asset.site?.city?.name ?? null,

        province: nap.asset.site?.city?.province?.name ?? null,
      },
    }));
  }
}