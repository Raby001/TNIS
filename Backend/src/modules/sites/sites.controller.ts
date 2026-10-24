import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { Site } from './entities/site.entity';
import { UpdateSiteDto } from './dto/update-site.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import { SiteQueryDto } from './dto/site-query.dto';

@ApiTags('Sites')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sites')
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,
  ) {}

  // ==================================================
  // ================ Create ==========================
  // ==================================================


  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a site',
    description: 'Creates a site at a geographic Point location. The site must belong to an existing city.',
  })
  @ApiResponse({
    status: 201,
    description: 'Site created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid geometry or duplicate site code.',
  })
  @ApiResponse({
    status: 404,
    description: 'The specified city does not exist.',
  })
  async create(@Body() dto: CreateSiteDto,): Promise<any> {
    return this.sitesService.create(dto);
  }


  // ==================================================
  // ================ Get ==========================
  // ==================================================
  
  // get all the sites
  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all sites',
    description: 'Returns all sites together with their city and province.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sites retrieved successfully.',
  })
  async findAll(@Query() query: SiteQueryDto) {
    return this.sitesService.findAll(query);
  }

  // get all the asset in sites
  @Get(':id/assets')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get assets in a site',
    description: 'Returns all assets located at the specified site, including their asset type and status.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the site.',
    example: 'e9c4dfed-776b-43e8-b8e6-12bb487101c4',
  })
  @ApiResponse({
    status: 200,
    description: 'Assets retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Site not found.',
  })
  async findAssets(
    @Param('id') id: string,
  ) {
    return this.sitesService.findAssets(id);
  }


  // get all the asset that can connect to a specific site
  @Get(':id/fiber-endpoints')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get fiber connection endpoints in a site',
    description: 'Returns assets within the specified site that are allowed to connect to fiber.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the site.',
    example: 'e9c4dfed-776b-43e8-b8e6-12bb487101c4',
  })
  @ApiResponse({
    status: 200,
    description: 'Fiber connection endpoints retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Site not found.',
  })
  async findFiberEndpoints(
    @Param('id') id: string,
  ) {
    return this.sitesService.findFiberEndpoints(id);
  }  


  @Get('map')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all sites',
    description: 'Returns all sites together with their city and province.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sites retrieved successfully.',
  })
  findAllForMap() {
    return this.sitesService.findAllForMap();
  }

  // get site by id
  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a site by ID',
    description: 'Returns a site together with its city and province information.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the site.',
    example: 'e9c4dfed-776b-43e8-b8e6-12bb487101c4',
  })
  @ApiResponse({
    status: 200,
    description: 'Site found successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Site not found.',
  })
  async findOne( @Param('id') id: string ): Promise<Site> {
    return this.sitesService.findOne(id);
  }


  // ==================================================
  // ================ Update ==========================
  // ==================================================

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a site',
    description: 'Updates site information. The generated site code and city cannot be changed.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the site.',
    example: 'e9c4dfed-776b-43e8-b8e6-12bb487101c4',
  })
  @ApiResponse({
    status: 200,
    description: 'Site updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Site not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSiteDto,
  ) {
    return this.sitesService.update(id, dto);
  }

  // ==================================================
  // ================ Delete ==========================
  // ==================================================

  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a site',
    description: 'Deletes a site by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the site.',
    example: 'e9c4dfed-776b-43e8-b8e6-12bb487101c4',
  })
  @ApiResponse({
    status: 200,
    description: 'Site deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Site not found.',
  })
  async remove(
    @Param('id') id: string,
  ): Promise<{message: string}> {
    return this.sitesService.remove(id);
  }

}