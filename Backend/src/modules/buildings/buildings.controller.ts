import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, } from '@nestjs/swagger';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';

@ApiTags('Buildings')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('buildings')
export class BuildingsController {

  constructor(
    private readonly buildingsService: BuildingsService,
  ) {}

  // ========================================================
  // Create
  // ========================================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a building',
    description: 'Creates a building under an existing site and automatically generates its hierarchical code.',
  })
  @ApiResponse({
    status: 201,
    description: 'Building created successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Site not found.',
  })
  async create(
    @Body() dto: CreateBuildingDto,
  ) {
    return this.buildingsService.create(dto);
  }

  // ========================================================
  // Get All
  // ========================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all buildings',
  })
  async findAll() {
    return this.buildingsService.findAll();
  }

  // ========================================================
  // Get One
  // ========================================================

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a building',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the building.',
  })
  @ApiResponse({
    status: 404,
    description: 'Building not found.',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.buildingsService.findOne(id);
  }

  // ========================================================
  // Update
  // ========================================================

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a building',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBuildingDto,
  ) {
    return this.buildingsService.update(id, dto);
  }

  // ========================================================
  // Delete
  // ========================================================

  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a building',
  })
  async remove(
    @Param('id') id: string,
  ): Promise<void> {
    return this.buildingsService.remove(id);
  }
}