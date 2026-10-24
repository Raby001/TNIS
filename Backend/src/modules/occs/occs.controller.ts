import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/access-control/guards/permissions.guard';
import { Permissions } from 'src/modules/access-control/decorators/permissions.decorator';
import { CreateOccDto } from './dto/create-occ.dto';
import { UpdateOccDto } from './dto/update-occ.dto';
import { OccsService } from './occs.service';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';

@ApiTags('OCCs')
@ApiBearerAuth('JWT')
@UseGuards(
  JwtAuthGuard,
  PermissionsGuard,
)
@Controller('occs')
export class OccsController {

  constructor(
    private readonly occsService: OccsService,
  ) {}

  // =======================================================
  // Create
  // =======================================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create an OCC',
  })
  @ApiResponse({
    status: 201,
    description: 'OCC created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OCC asset type.',
  })
  @ApiResponse({
    status: 404,
    description: 'Asset type not found.',
  })
  async create(
    @Body() dto: CreateOccDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.occsService.create(
      dto,
      user.id,
    );
  }

  // =======================================================
  // Find All
  // =======================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all OCCs',
  })
  @ApiResponse({
    status: 200,
    description: 'OCCs retrieved successfully.',
  })
  async findAll() {
    return this.occsService.findAll();
  }

  // =======================================================
  // Find One
  // =======================================================

  
  @Get(':assetId')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get an OCC by Asset ID',
  })
  @ApiParam({
    name: 'assetId',
    description: 'Asset ID of the OCC.',
  })
  @ApiResponse({
    status: 200,
    description: 'OCC retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'OCC not found.',
  })
  async findOne(
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ) {
    return this.occsService.findOne(
      assetId,
    );
  }

  // =======================================================
  // Update
  // =======================================================

  @Patch(':assetId')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update an OCC',
  })
  @ApiParam({
    name: 'assetId',
    description: 'Asset ID of the OCC.',
  })
  @ApiResponse({
    status: 200,
    description: 'OCC updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'OCC not found.',
  })
  async update(
    @Param('assetId', ParseUUIDPipe) assetId: string, 
    @Body() dto: UpdateOccDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.occsService.update(
      assetId,
      dto,
      user.id,
    );
  }

  // =======================================================
  // Delete
  // =======================================================

  @Delete(':assetId')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete an OCC',
  })
  @ApiParam({
    name: 'assetId',
    description: 'Asset ID of the OCC.',
  })
  @ApiResponse({
    status: 200,
    description: 'OCC deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'OCC not found.',
  })
  async remove(
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ): Promise<{message: string}> {
    return this.occsService.remove(assetId);
  }
}