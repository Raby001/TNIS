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

    if (query.statusId) {
      qb.andWhere(
        'status.id = :statusId',
        {
          statusId: query.statusId,
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
        status: pole.asset.status?.name ?? null,
        statusId: pole.asset.status?.id ?? null,

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