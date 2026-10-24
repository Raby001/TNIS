import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MAP_FEATURE_PROVIDERS, MAP_FEATURE_TYPES } from './constants/map.constants';
import { MapFeatureProvider } from './interfaces/map-feature-provider.interface';
import { MapQueryDto } from './dto/map-query.dto';

@Injectable()
export class MapService {
  constructor(
    @Inject(MAP_FEATURE_PROVIDERS)
    private readonly providers: MapFeatureProvider[],
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

    return {
      type: 'FeatureCollection',

      features:
        featureArrays.flat(),
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