import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manhole } from 'src/modules/manholes/entities/manhole.entity';
import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';

@Injectable()
export class ManholeMapFeatureProvider implements MapFeatureProvider {
  constructor(
    @InjectRepository(Manhole)
    private readonly manholeRepository: Repository<Manhole>,
  ) {}

  getType(): string {
    return 'MANHOLE';
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {
    const qb = this.manholeRepository
      .createQueryBuilder('manhole')

      .innerJoinAndSelect(
        'manhole.asset',
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
          OR manhole.material ILIKE :search
          OR manhole.cover_type ILIKE :search
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
    // Status
    // ========================================================

    if (query.statusId) {
      qb.andWhere(
        'status.id = :statusId',
        {
          statusId: query.statusId,
        },
      );
    }

    // ========================================================
    // Limit
    // ========================================================

    if (query.limit) {
      qb.take(query.limit);
    }

    const manholes = await qb.getMany();

    // ========================================================
    // GeoJSON Features
    // ========================================================

    return manholes.map((manhole) => ({
      type: 'Feature',

      geometry: manhole.asset.geometry,

      properties: {
        // Manhole
        assetId: manhole.assetId,
        type: 'MANHOLE',

        // Common Asset information
        name: manhole.asset.name,
        code: manhole.asset.code,
        assetTag: manhole.asset.assetTag,
        serialNumber: manhole.asset.serialNumber,
        description: manhole.asset.description,
        installationDate: manhole.asset.installationDate ?? null,

        // Status
        status: manhole.asset.status?.name ?? null,
        statusId: manhole.asset.status?.id ?? null,

        // Manhole-specific information
        depthM: manhole.depthM,
        material: manhole.material,
        coverType: manhole.coverType,
        
        // Location
        siteId: manhole.asset.siteId,

        site: manhole.asset.site?.name ?? null,

        city: manhole.asset.site?.city?.name ?? null,

        province: manhole.asset.site?.city?.province?.name ?? null,
      },
    }));
  }
}