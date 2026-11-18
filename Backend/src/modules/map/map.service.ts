import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MAP_FEATURE_PROVIDERS, MAP_FEATURE_TYPES } from './constants/map.constants';
import { MapFeatureProvider } from './interfaces/map-feature-provider.interface';
import { MapQueryDto } from './dto/map-query.dto';
import { MapSymbolsService } from '../map-symbols/map-symbols.service';

@Injectable()
export class MapService {
  constructor(
    @Inject(MAP_FEATURE_PROVIDERS)
    private readonly providers: MapFeatureProvider[],

    private readonly mapSymbolsService: MapSymbolsService,
  ) {}

  // ========================================================
  // Get Map Features
  // ========================================================

  async findFeatures(
    query: MapQueryDto,
  ) {
    const requestedTypes = this.parseTypes(query.types);

    this.validateTypes(requestedTypes);

    const selectedProviders = this.getSelectedProviders(requestedTypes);

    const featureArrays = await Promise.all(
        selectedProviders.map(
          (provider) =>
            provider.getFeatures(query),
        ),
      );

    const features = featureArrays.flat();

    // Load all icon configurations once.
    const {
      assetTypeIcons,
      siteOverrides,
      defaultSiteIcon,
    } = await this.mapSymbolsService.getMapIconConfigurations();

    // Build lookup maps.
    const assetTypeIconMap = new Map(
      assetTypeIcons.map((item) => [
        item.assetTypeId,
        {
          url: item.iconUrl,
          mimeType: item.mimeType,
        },
      ]),
    );

    const siteIconOverrideMap = new Map(
      siteOverrides.map((item) => [
        item.siteId,
        {
          url: item.iconUrl,
          mimeType: item.mimeType,
        },
      ]),
    );

    const defaultSiteIconData = defaultSiteIcon
      ? {
          url: defaultSiteIcon.iconUrl,
          mimeType: defaultSiteIcon.mimeType,
        }
      : null;

    // Attach icons to features.
    const enrichedFeatures = features.map((feature) => {
      const properties = feature.properties ?? {};

      // Site icon: individual override first, then global default.
      if (properties.type === 'SITE') {
        const icon =
          siteIconOverrideMap.get(properties.id) ??
          defaultSiteIconData;

        return {
          ...feature,
          properties: {
            ...properties,
            icon,
          },
        };
      }

      // Asset icon: use the configured icon for its asset type.
      const icon = properties.assetTypeId
        ? assetTypeIconMap.get(properties.assetTypeId) ?? null
        : null;

      return {
        ...feature,
        properties: {
          ...properties,
          icon,
        },
      };
    });

    return {
      type: 'FeatureCollection',
      features: enrichedFeatures,
    };
      
  }

  // ========================================================
  // Map Statistics
  // ========================================================

  async getStatistics(
    query: MapQueryDto,
  ) {
    const requestedTypes = this.parseTypes(query.types);

    this.validateTypes(requestedTypes);

    const selectedProviders = this.getSelectedProviders(requestedTypes);

    const statisticsQuery: MapQueryDto = {
      ...query,
      limit: undefined,
    };

    const results = await Promise.all(
        selectedProviders.map(
          async (provider) => {
            const features =
              await provider.getFeatures(
                statisticsQuery,
              );

            return {
              type: provider.getType(),
              count: features.length,
            };
          },
        ),
      );
      
    const layers: Record<string, number> = {};

    for (const result of results) {
      layers[result.type] = result.count;
    }

    const total = results.reduce(
        (sum, result) =>
          sum + result.count,
        0,
      );

    return {
      total,
      layers,
    };
  }

  // ========================================================
  // Parse Requested Types
  // ========================================================

  private parseTypes(
    types?: string,
  ): string[] | undefined {
    return types
      ?.split(',')
      .map((type) =>
        type.trim().toUpperCase(),
      )
      .filter(Boolean);
  }

  // ========================================================
  // Validate Requested Types
  // ========================================================

  private validateTypes(
    requestedTypes?: string[],
  ): void {
    if (!requestedTypes?.length) {
      return;
    }

    const invalidTypes = requestedTypes.filter(
        (type) =>
          !MAP_FEATURE_TYPES.includes(
            type as (typeof MAP_FEATURE_TYPES)[number],
          ),
      );

    if (invalidTypes.length > 0) {
      throw new BadRequestException(
        `Unsupported map feature type(s): ${invalidTypes.join(', ')}`,
      );
    }
  }

  // ========================================================
  // Select Providers
  // ========================================================

  private getSelectedProviders(
    requestedTypes?: string[],
  ): MapFeatureProvider[] {

    if (!requestedTypes?.length) {
      return this.providers;
    }

    return this.providers.filter(
      (provider) =>
        requestedTypes.includes(
          provider.getType(),
        ),
    );
  }
}