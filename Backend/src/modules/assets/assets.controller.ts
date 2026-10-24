import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetQueryDto } from './dto/asset-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';

@ApiTags('Assets')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
  ) {}

  // ========================================================
  // Get all assets
  // ========================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get assets',
    description: 'Returns assets with optional search, filtering, sorting, and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Assets retrieved successfully.',
  })
  async findAll(@Query() query: AssetQueryDto) {
    return this.assetsService.findAll(query);
  }

  // ========================================================
  // Get asset by id
  // ========================================================

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get an asset by ID',
    description: 'Returns a single asset using its UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the asset.',
    example: '0198f2c4-1234-7abc-8def-123456789abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Asset retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Asset not found.',
  })
  async findOne( @Param('id') id: string ) {
    return this.assetsService.findOne(id);
  }


  // ========================================================
  // Create asset 
  // ========================================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a new asset',
    description: 'Creates a new asset. The client provides the asset type, status, region, and asset information. The backend automatically generates the official asset code according to the configured asset-code pattern.',
  })
  @ApiResponse({
    status: 201,
    description: 'Asset created successfully. The generated asset code is returned in the response.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or the asset type does not have a configured code-generation rule.',
  })
  @ApiResponse({
    status: 404,
    description: 'The specified asset type or status does not exist.',
  })
  async create(
    @Body() dto: CreateAssetDto, 
    @Req() request: Request 
  ) {
    const user = request.user as User;
    return this.assetsService.create(
      dto, user.id
    );
  }

  // ========================================================
  // Update asset by id
  // ========================================================
  
  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update an asset',
    description: 'Updates editable information of an existing asset. The natural asset code cannot be changed through this endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the asset to update.',
    example: '0198f2c4-1234-7abc-8def-123456789abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Asset updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Asset or requested status was not found.',
  })
  async update(
    @Param('id') id: string, 
    @Body() dto: UpdateAssetDto, 
    @Req() request: Request 
  ) {
    const user = request.user as User;
    return this.assetsService.update(id, dto, user.id);
  }

}