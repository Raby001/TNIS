import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Tower } from './entities/tower.entity';
import { CreateTowerDto } from './dto/create-tower.dto';
import { UpdateTowerDto } from './dto/update-tower.dto';
import { TowersService } from './towers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Towers')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('towers')
export class TowersController {
  constructor(
    private readonly towersService: TowersService,
  ) {}

  // ========================================================
  // Get
  // ========================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all towers',
    description: 'Returns all towers together with their asset information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Towers retrieved successfully.',
  })
  async findAll(): Promise<Tower[]> {
    return this.towersService.findAll();
  }

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a tower',
  })
  @ApiParam({
    name: 'id',
    description: 'Tower ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tower retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tower not found.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Tower> {
    return this.towersService.findOne(id);
  }

  // ========================================================
  // Create
  // ========================================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a tower',
    description: 'Creates the common Asset record and its Tower-specific record in one transaction.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tower created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid tower data or asset type.',
  })
  @ApiResponse({
    status: 404,
    description: 'Asset type, status, site, or user not found.',
  })
  async create(
    @Body() dto: CreateTowerDto,
    @Req() request: Request,
  ): Promise<Tower> {
    const user = request.user as User;

    return this.towersService.create(dto, user.id);
  }

  // ========================================================
  // Update
  // ========================================================

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a tower',
  })
  @ApiParam({
    name: 'id',
    description: 'Tower ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tower updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tower not found.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTowerDto,
    @Req() request: Request,
  ): Promise<Tower> {
    const user = request.user as User;

    return this.towersService.update(
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
    summary: 'Delete a tower',
    description: 'Deletes the tower and its associated Asset record.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tower ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tower deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tower not found.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{message: string}> {
    return this.towersService.remove(id);
  }
}