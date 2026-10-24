import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MapService } from './map.service';
import { MapQueryDto } from './dto/map-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';

@ApiTags('Map')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('map')
export class MapController {
  constructor(
    private readonly mapService: MapService,
  ) {}
  // ========================================================
  // Map Features
  // ========================================================

  @Get('features')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get map features',
    description:
      'Returns GeoJSON map features from the selected layers. Supports layer selection, search, province/city/site filtering, status filtering, and result limits.',
  })
  async findFeatures(
    @Query() query: MapQueryDto,
  ) {
    return this.mapService.findFeatures(query);
  }

  // ========================================================
  // Map Statistics
  // ========================================================

  @Get('statistics')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get map statistics',
    description:
      'Returns the number of map features grouped by layer. Supports the same layer, search, province, city, site, and status filters as the map features endpoint.',
  })
  async getStatistics(
    @Query() query: MapQueryDto,
  ) {
    return this.mapService.getStatistics(
      query,
    );
  }

}