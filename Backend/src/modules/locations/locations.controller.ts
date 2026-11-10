import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import { LocationsService } from './locations.service';

@ApiTags('Locations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('locations')
export class LocationsController {

  constructor(
    private readonly locationsService: LocationsService,
  ) {}

  // =======================================================
  // Get All Provinces
  // =======================================================

  @Get('provinces')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all provinces with the whole Coordornate. Use api in reference data if the app do not need geometry',
    description:'Returns all provinces ordered alphabetically by name.',
  })
  @ApiResponse({
    status: 200,
    description: 'Provinces retrieved successfully.',
  })
  async findProvinces() {
    return this.locationsService.findProvinces();
  }

  // =======================================================
  // Cities by Province
  // =======================================================

  @Get('provinces/:provinceId/cities')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get cities by province',
    description:
      'Returns all cities belonging to the specified province.',
  })
  @ApiParam({
    name: 'provinceId',
    description: 'UUID of the province.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Cities retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Province not found.',
  })
  async findCitiesByProvince(
    @Param(
      'provinceId',
      ParseUUIDPipe,
    )
    provinceId: string,
  ) {
    return this.locationsService.findCitiesByProvince(
      provinceId,
    );
  }

  // =======================================================
  // Sites by City
  // =======================================================

  @Get('cities/:cityId/sites')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get sites by city',
    description:
      'Returns all sites belonging to the specified city.',
  })
  @ApiParam({
    name: 'cityId',
    description: 'UUID of the city.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Sites retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'City not found.',
  })
  async findSitesByCity(
    @Param(
      'cityId',
      ParseUUIDPipe,
    )
    cityId: string,
  ) {
    return this.locationsService.findSitesByCity(
      cityId,
    );
  }

  // =======================================================
  // Sites by Province
  // =======================================================

  @Get('provinces/:provinceId/sites')
  @ApiOperation({
    summary: 'Get all sites by province',
    description:
      'Returns all sites that belong to the specified province.',
  })
  @ApiParam({
    name: 'provinceId',
    description: 'Province UUID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sites retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Province not found.',
  })
  async findSitesByProvince(
    @Param('provinceId') provinceId: string,
  ) {
    return this.locationsService.findSitesByProvince(provinceId);
  }

}