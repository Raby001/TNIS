import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiberCable } from 'src/modules/cables/entities/fiber-cable.entity';
import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';
import { FiberCableConnectionTargetType } from 'src/modules/fiber-cable-connections/entities/fiber-cable-connection.entity';

@Injectable()
export class FiberCableMapFeatureProvider implements MapFeatureProvider {

  constructor(
    @InjectRepository(FiberCable)
    private readonly fiberCableRepository: Repository<FiberCable>,
  ) {}

  getType(): string {
    return 'FIBER_CABLE';
  }

  private async getInstallationSegmentGeometry(
    cableGeometry: any,
    fromGeometry: any,
    toGeometry: any,
  ): Promise<any | null> {
    if (!cableGeometry || !fromGeometry || !toGeometry) {
      return null;
    }

    const result = await this.fiberCableRepository.manager.query(
      `
      WITH cable AS (
        SELECT
          ST_GeomFromGeoJSON($1)::geometry AS geometry
      ),

      from_point AS (
        SELECT
          ST_GeomFromGeoJSON($2)::geometry AS geometry
      ),

      to_point AS (
        SELECT
          ST_GeomFromGeoJSON($3)::geometry AS geometry
      )

      SELECT
        ST_AsGeoJSON(
          ST_LineSubstring(
            cable.geometry,
            LEAST(
              ST_LineLocatePoint(
                cable.geometry,
                from_point.geometry
              ),
              ST_LineLocatePoint(
                cable.geometry,
                to_point.geometry
              )
            ),
            GREATEST(
              ST_LineLocatePoint(
                cable.geometry,
                from_point.geometry
              ),
              ST_LineLocatePoint(
                cable.geometry,
                to_point.geometry
              )
            )
          )
        )::json AS geometry

      FROM cable, from_point, to_point
      `,
      [
        JSON.stringify(cableGeometry),
        JSON.stringify(fromGeometry),
        JSON.stringify(toGeometry),
      ],
    );

    return result[0]?.geometry ?? null;
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {

    const qb = this.fiberCableRepository
      .createQueryBuilder('fiberCable')

      .innerJoinAndSelect(
        'fiberCable.asset',
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

      .leftJoinAndSelect(
        'city.province',
        'province',
      )

      .leftJoinAndSelect(
        'fiberCable.cableType',
        'cableType',
      )

      .leftJoinAndSelect(
        'fiberCable.coreCount',
        'coreCount',
      )

      .leftJoinAndSelect(
        'fiberCable.installationMethod',
        'installationMethod',
      )
      .leftJoinAndSelect(
        'fiberCable.installationSegments',
        'installationSegment',
      )

      .leftJoinAndSelect(
        'installationSegment.installationMethod',
        'segmentInstallationMethod',
      )

      .leftJoinAndSelect(
        'installationSegment.fromConnection',
        'fromConnection',
      )

      .leftJoinAndSelect(
        'fromConnection.asset',
        'fromAsset',
      )

      .leftJoinAndSelect(
        'fromConnection.site',
        'fromSite',
      )

      .leftJoinAndSelect(
        'installationSegment.toConnection',
        'toConnection',
      )

      .leftJoinAndSelect(
        'toConnection.asset',
        'toAsset',
      )

      .leftJoinAndSelect(
        'toConnection.site',
        'toSite',
      )
            .leftJoinAndSelect(
        'fiberCable.segmentType',
        'segmentType',
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

    // ========================================================
    // Fiber Cable Filters
    // ========================================================

    if (query.coreCountId) {
      qb.andWhere(
        'coreCount.id = :coreCountId',
        {
          coreCountId: query.coreCountId,
        },
      );
    }

    if (query.segmentTypeId) {
      qb.andWhere(
        'segmentType.id = :segmentTypeId',
        {
          segmentTypeId: query.segmentTypeId,
        },
      );
    }

    if (query.cableTypeId) {
      qb.andWhere(
        'cableType.id = :cableTypeId',
        {
          cableTypeId: query.cableTypeId,
        },
      );
    }

    if (query.installationMethodId) {
      qb.andWhere(
        'installationMethod.id = :installationMethodId',
        {
          installationMethodId:
            query.installationMethodId,
        },
      );
    }

    // ========================================================
    // Limit
    // ========================================================

    if (query.limit) {
      qb.take(query.limit);
    }

    const fiberCables = await qb.getMany();

    return Promise.all(
      fiberCables.map(async (fiberCable) => ({
        type: 'Feature',

        geometry: fiberCable.asset.geometry,

        properties: {
          // ============================================
          // Asset
          // ============================================
          assetId: fiberCable.assetId,

          type: 'FIBER_CABLE',

          name: fiberCable.asset.name,

          code: fiberCable.asset.code,

          assetTag: fiberCable.asset.assetTag,

          serialNumber: fiberCable.asset.serialNumber,

          description: fiberCable.asset.description,

          // ============================================
          // Status
          // ============================================

          lifecycleStatusId: fiberCable.asset.lifecycleStatus?.id ?? null, 
          lifecycleStatus: fiberCable.asset.lifecycleStatus?.name ?? null,

          condition: fiberCable.asset.condition?.name ?? null,
          conditionId: fiberCable.asset.condition?.id ?? null,
          
          manufacturer: fiberCable.asset.manufacturer,
          model: fiberCable.asset.model,
          // ============================================
          // Fiber Cable Relationships
          // ============================================

          cableTypeId: fiberCable.cableTypeId,

          coreCountId: fiberCable.coreCountId,

          installationMethodId: fiberCable.installationMethodId,

          segmentTypeId: fiberCable.segmentTypeId,

          installationSegments: await Promise.all(
            (fiberCable.installationSegments ?? []).map(
              async (segment) => {
                const fromGeometry = segment.fromConnection.targetType === FiberCableConnectionTargetType.ASSET
                    ? segment.fromConnection.asset?.geometry
                    : segment.fromConnection.site?.geometry;

                const toGeometry = segment.toConnection.targetType ===
                  FiberCableConnectionTargetType.ASSET
                    ? segment.toConnection.asset?.geometry
                    : segment.toConnection.site?.geometry;

                const geometry = await this.getInstallationSegmentGeometry(
                    fiberCable.asset.geometry,
                    fromGeometry,
                    toGeometry,
                  );

                return {
                  id: segment.id,

                  from: {
                    connectionId: segment.fromConnection.id,

                    sequence: segment.fromConnection.sequence,

                    connectionRole: segment.fromConnection.connectionRole,

                    targetType: segment.fromConnection.targetType,

                    assetId: segment.fromConnection.assetId,

                    siteId: segment.fromConnection.siteId,
                  },

                  to: {
                    connectionId: segment.toConnection.id,

                    sequence: segment.toConnection.sequence,

                    connectionRole: segment.toConnection.connectionRole,

                    targetType: segment.toConnection.targetType,

                    assetId: segment.toConnection.assetId,

                    siteId: segment.toConnection.siteId,
                  },

                  installationMethod: {
                    id: segment.installationMethod.id,

                    name: segment.installationMethod.name,

                    lineStyle: segment.installationMethod.lineStyle ?? null,
                  },

                  geometry,
                };
              },
            ),
          ),

          suggestedHexColor: fiberCable.coreCount.suggestedColorName ?? null,

          lineStyle: fiberCable.installationMethod.lineStyle ?? null,

          // ============================================
          // Fiber Cable Information
          // ============================================
          length: fiberCable.installedLengthM ?? null,
          
          installedLengthM: fiberCable.installedLengthM ?? null,

          installationDate: fiberCable.asset.installationDate ?? null,

          // ============================================
          // Location
          // ============================================

          siteId: fiberCable.asset.siteId,

          cityId: fiberCable.asset.site?.city?.id ?? null,

          provinceId: fiberCable.asset.site?.city?.province?.id ?? null,
        },
      }))
    );
  }
}