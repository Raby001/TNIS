import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { Province } from './entities/province.entity';
import { Site } from '../sites/entities/site.entity';

@Injectable()
export class LocationsService {

  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,

    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  // =======================================================
  // Get all the province with geometry
  // =======================================================
  async findProvinces() {
    return this.provinceRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  // =======================================================
  // Cities by Province
  // =======================================================

  async findCitiesByProvince(
    provinceId: string,
  ): Promise<City[]> {

    const province = await this.provinceRepository.findOne({
        where: {
          id: provinceId,
        },
      });

    if (!province) {
      throw new NotFoundException(
        `Province with ID ${provinceId} not found.`,
      );
    }

    return this.cityRepository.find({
      where: {
        provinceId,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  // =======================================================
  // Sites by City
  // =======================================================

  async findSitesByCity(
    cityId: string,
  ): Promise<Site[]> {

    const city = await this.cityRepository.findOne({
        where: {
          id: cityId,
        },
      });

    if (!city) {
      throw new NotFoundException(
        `City with ID ${cityId} not found.`,
      );
    }

    return this.siteRepository.find({
      where: {
        cityId,
      },
      order: {
        name: 'ASC',
      },
    });
  }

// =======================================================
// Sites by Province
// =======================================================

  async findSitesByProvince(
    provinceId: string,
  ): Promise<Site[]> {

    const province = await this.provinceRepository.findOne({
      where: {
        id: provinceId,
      },
    });

    if (!province) {
      throw new NotFoundException(
        `Province with ID ${provinceId} not found.`,
      );
    }

    return this.siteRepository.find({
      where: {
        city: {
          provinceId,
        },
      },
      relations: {
        city: {
          province: true,
        },
      },
      order: {
        name: 'ASC',
      },
    });
  }

}