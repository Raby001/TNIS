import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Site } from './entities/site.entity';
import { CreateSiteDto } from './dto/create-site.dto';
import { toGeometry } from 'src/common/mappers/geometry.mapper';
import { City } from '../locations/entities/city.entity';
import { HierarchyCodeSequenceService } from '../hierarchy/services/heirarchy-code.service';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Asset } from '../assets/entities/asset.entity';
import { SiteQueryDto } from './dto/site-query.dto';
import { FiberCableConnection } from '../fiber-cable-connections/entities/fiber-cable-connection.entity';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,

    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,

    private readonly heirarchyService: HierarchyCodeSequenceService,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    private readonly dataSource: DataSource,

  ) {}

  // ========================================================
  // ============= Create ===================================
  // ========================================================


  async create(dto: CreateSiteDto): Promise<Site> {

    const city = await this.cityRepository.findOne({
      where: {
        id: dto.cityId,
      },
      relations: {
        province: true,
      }
    })

    if(!city){
      throw new NotFoundException(
        `City with ID: ${dto.cityId} is not Found.`
      )
    }

    const geometry = toGeometry(dto.geometry);

    if (geometry.type !== 'Point') {
      throw new BadRequestException(
        'Invalid geometry type for Site. Site requires Point geometry.',
      );
    }

    const parentCode = `KH.${city.province.code}.${city.code}`;

    const code = await this.heirarchyService.generateCode(parentCode, 'POP', 2)

    const site = this.siteRepository.create({
      city,
      code,
      name: dto.name,
      address: dto.address ?? null,
      elevation: dto.elevation ?? null,
      description: dto.description ?? null,
      geometry,
    });

    return this.siteRepository.save(site);
  }

  // ========================================================
  // ================ Get ===================================
  // ========================================================

  async findOne(id: string): Promise<Site> {
    const site = await this.siteRepository.findOne({
      where: {
        id,
      },
      relations: {
        city: {
          province: true,
        },
      },
    });

    if (!site) {
      throw new NotFoundException(
        `Site with ID ${id} not found.`,
      );
    }

    return site;
  }

  async findAll(query: SiteQueryDto) {
    const {
      search,
      cityId,
      page = 1,
      limit = 20,
    } = query;

    const queryBuilder = this.siteRepository
      .createQueryBuilder('site')
      .leftJoinAndSelect('site.city', 'city')
      .leftJoinAndSelect('city.province', 'province');

    // ==========================================
    // Search
    // ==========================================

    if (search) {
      queryBuilder.andWhere(
        `(
          site.code ILIKE :search
          OR site.name ILIKE :search
          OR site.address ILIKE :search
          OR city.name ILIKE :search
          OR province.name ILIKE :search
        )`,
        {
          search: `%${search}%`,
        },
      );
    }

    // ==========================================
    // City filter
    // ==========================================

    if (cityId) {
      queryBuilder.andWhere(
        'site.city_id = :cityId',
        {
          cityId,
        },
      );
    }

    // ==========================================
    // Sorting
    // ==========================================

    queryBuilder
      .orderBy('site.code', 'ASC')
      .addOrderBy('site.id', 'ASC');

    // ==========================================
    // Pagination
    // ==========================================

    const skip = (page - 1) * limit;

    queryBuilder
      .skip(skip)
      .take(limit);

    // ==========================================
    // Execute
    // ==========================================

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

async findAllForMap() {
  return this.siteRepository
    .createQueryBuilder('site')
    .leftJoinAndSelect('site.city', 'city')
    .leftJoinAndSelect('city.province', 'province')
    .getMany();
}

  async findAssets(siteId: string): Promise<Asset[]> {
    const site = await this.siteRepository.findOne({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      throw new NotFoundException(
        `Site with ID ${siteId} not found.`,
      );
    }

    return this.assetRepository.find({
      where: {
        siteId,
      },
      relations: {
        assetType: true,
        lifecycleStatus: true,
        condition: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findFiberEndpoints(siteId: string): Promise<Asset[]> {

    const site = await this.siteRepository.findOne({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      throw new NotFoundException(
        `Site with ID ${siteId} not found.`,
      );
    }

    return this.assetRepository.find({
      where: {
        siteId,
      },
      relations: {
        assetType: true,
        lifecycleStatus: true,
        condition: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  // ========================================================
  // ============= Update ===================================
  // ========================================================

  async update(id: string, dto: UpdateSiteDto): Promise<Site>{
    const site = await this.siteRepository.findOne({
      where: {
        id,
      },
      relations: {
        city: {
          province: true,
        }
      }
    })

    if(!site){
      throw new NotFoundException(
        `Site with ID: ${id} is not Founded.`
      )
    }

    if(dto.geometry !== undefined){
      const geometry = toGeometry(dto.geometry);

      if(geometry.type !== 'Point'){
        throw new BadRequestException(
          'Invalid geometry type for Site. Site requires Point geometry.',
        )
      }

      site.geometry = geometry;
    }

    if (dto.name !== undefined) {
      site.name = dto.name;
    }

    if (dto.address !== undefined) {
      site.address = dto.address;
    }

    if (dto.elevation !== undefined) {
      site.elevation = dto.elevation;
    }

    if (dto.description !== undefined) {
      site.description = dto.description;
    }

    return this.siteRepository.save(site);
  }

  // ========================================================
  // ============= Delete ===================================
  // ========================================================
  async remove(id: string): Promise<{ message: string }> {
    return this.dataSource.transaction(async (manager) => {
      const siteRepo = manager.getRepository(Site);
      const assetRepo = manager.getRepository(Asset);
      const connectionRepo = manager.getRepository(FiberCableConnection);

      // 1. Find the site
      const site = await siteRepo.findOne({
        where: { id },
      });

      if (!site) {
        throw new NotFoundException(
          `Site with ID ${id} not found.`,
        );
      }

      // 2. Check whether assets still reference this site
      const assets = await assetRepo.find({
        where: { siteId: id },
        select: { id: true },
      });

      if (assets.length > 0) {
        throw new ConflictException({
          statusCode: 409,
          message:
            'Cannot delete this site because one or more assets are assigned to it. Reassign or remove those assets first.',
          siteId: id,
          assetIds: assets.map((asset) => asset.id),
        });
      }

      // 3. Check whether a fiber cable references this site
      const connections = await connectionRepo.find({
        where: { siteId: id },
      });

      if (connections.length > 0) {
        throw new ConflictException({
          statusCode: 409,
          message:
            'Cannot delete this site because it is used by one or more fiber cable connections. Delete the fiber cable or change its target first.',
          siteId: id,
          fiberCableIds: [
            ...new Set(
              connections.map(
                (connection) => connection.fiberCableId,
              ),
            ),
          ],
        });
      }

      // 4. Delete the site
      await siteRepo.remove(site);

      return {
        message: 'Site deleted successfully.',
      };
    });
  }

}