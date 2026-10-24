import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OpticalSplittersService } from './optical-splitters.service';
import { CreateOpticalSplitterDto } from './dto/create-optical-splitter.dto';
import { UpdateOpticalSplitterDto } from './dto/update-optical-splitter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';

@ApiTags('Optical Splitters')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('optical-splitters')
export class OpticalSplittersController {

  constructor(
    private readonly opticalSplittersService: OpticalSplittersService,
  ) {}

  // ========================================================
  // Create
  // ========================================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create an optical splitter',
  })
  @ApiResponse({
    status: 201,
    description: 'Optical splitter created successfully.',
  })
  create(
    @Body() dto: CreateOpticalSplitterDto,
    @Req() request: Request,
  ) {
  const user = request.user as User;

    return this.opticalSplittersService.create(dto, user.id);
  }

  // ========================================================
  // Find All
  // ========================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all optical splitters',
  })
  findAll() {
    return this.opticalSplittersService.findAll();
  }

  // ========================================================
  // Find One
  // ========================================================

  @Get('parent/:parentAssetId')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all optical splitters belonging to an LCP or NAP',
  })
  @ApiParam({
    name: 'parentAssetId',
    description: 'Asset ID of the LCP or NAP',
  })
  findByParentAsset(
    @Param('parentAssetId') parentAssetId: string,
  ) {
    return this.opticalSplittersService.findByParentAsset(
      parentAssetId,
    );
  }

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get an optical splitter by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Optical splitter UUID',
  })
  findOne(
    @Param('id') id: string,
  ) {
    return this.opticalSplittersService.findOne(id);
  }

  // ========================================================
  // Update
  // ========================================================

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update an optical splitter',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOpticalSplitterDto,
    @Req() request: Request,
  ) {
    const user = request.user as User;
    return this.opticalSplittersService.update(
      id,
      dto,
      user.id,
    );
  }

  // ========================================================
  // Delete
  // ========================================================

  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete an optical splitter',
  })
  remove(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.opticalSplittersService.remove(id);
  }
}