import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Province } from 'src/modules/locations/entities/province.entity';
import { Site } from 'src/modules/sites/entities/site.entity';
import { Geometry } from 'src/common/types/geometry.type';

@Injectable()
export class AssetProvinceService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  // Determine the province used for asset code generation.

  async resolveProvince(
    siteId?: string,
    geometry?: Geometry,
    manager?: EntityManager,
  ): Promise<Province> {
    if (siteId) {
      return this.findProvinceFromSite(siteId, manager);
    }

    if (geometry) {
      return this.findProvinceFromGeometry(geometry, manager);
    }

    throw new BadRequestException(
      'An asset must have either a site or geometry to determine its province.',
    );
  }


  // Get province from the asset's Site.

  private async findProvinceFromSite(
    siteId: string,
    manager?: EntityManager,
  ): Promise<Province> {
    const siteRepository =
      manager?.getRepository(Site) ?? this.siteRepository;

    const site = await siteRepository.findOne({
      where: {
        id: siteId,
      },
      relations: {
        city: {
          province: true,
        },
      },
    });

    if (!site) {
      throw new NotFoundException(
        `Site with ID ${siteId} not found.`,
      );
    }

    if (!site.city?.province) {
      throw new BadRequestException(
        `Site "${site.name}" does not have a province assigned.`,
      );
    }

    return site.city.province;
  }

  
  // Find the province containing the asset geometry.

  private async findProvinceFromGeometry(
    geometry: Geometry,
    manager?: EntityManager,
  ): Promise<Province> {
    const provinceRepository =
      manager?.getRepository(Province) ?? this.provinceRepository;

    const geoJson = JSON.stringify(geometry);

    const provinces = await provinceRepository
      .createQueryBuilder('province')
      .where(
        `
        ST_Covers(
          province.geometry,
          ST_SetSRID(
            ST_GeomFromGeoJSON(:geometry),
            4326
          )
        )
        `,
        {
          geometry: geoJson,
        },
      )
      .getMany();

    if (provinces.length === 1) {
      return provinces[0];
    }


    // A line or polygon may cross multiple provinces.

    const referencePoint = this.getReferencePoint(geometry);

    const province = await provinceRepository
      .createQueryBuilder('province')
      .where(
        `
        ST_Covers(
          province.geometry,
          ST_SetSRID(
            ST_GeomFromGeoJSON(:referencePoint),
            4326
          )
        )
        `,
        {
          referencePoint: JSON.stringify(referencePoint),
        },
      )
      .getOne();

    if (!province) {
      throw new BadRequestException(
        'Unable to determine a province from the asset geometry.',
      );
    }

    return province;
  }

  // Create a point used to determine the asset's primary province.

  private getReferencePoint(geometry: Geometry): Geometry {
    if (geometry.type === 'Point') {
      return geometry;
    }

    if (geometry.type === 'LineString') {
      return {
        type: 'Point',
        coordinates: geometry.coordinates[0],
      };
    }

    if (geometry.type === 'Polygon') {
      return {
        type: 'Point',
        coordinates: geometry.coordinates[0][0],
      };
    }

    // MultiPolygon
    return {
      type: 'Point',
      coordinates: geometry.coordinates[0][0][0],
    };
  }
}