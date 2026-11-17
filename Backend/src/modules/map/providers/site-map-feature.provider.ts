import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from 'src/modules/sites/entities/site.entity';
import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';

@Injectable()
export class SiteMapFeatureProvider implements MapFeatureProvider {

  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  getType(): string {
    return 'SITE';
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {

    const qb = this.siteRepository
      .createQueryBuilder('site')
      .leftJoinAndSelect('site.city', 'city')
      .leftJoin('city.province', 'province')
      .addSelect('province.id')
      .where('site.geometry IS NOT NULL');

    // ========================================================
    // Search
    // ========================================================

    if (query.search) {
      const search = `%${query.search.trim()}%`;

      qb.andWhere(
        `(
          site.name ILIKE :search
          OR site.code ILIKE :search
          OR site.address ILIKE :search
        )`,
        { search },
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

    if (query.limit) {
      qb.take(query.limit);
    }

    const sites = await qb.getMany();

    return sites.map((site) => ({
      type: 'Feature',

      geometry: site.geometry,

      properties: {
        id: site.id,

        type: 'SITE',

        name: site.name,

        code: site.code,

        address: site.address,

        elevation: site.elevation,

        description: site.description ?? null,

        city: site.city?.name ?? null,

        cityId: site.city?.id ?? null,

        province: site.city?.province?.name ?? null,

        provinceId: site.city?.province?.id ?? null,
      },
    }));
  }
}