import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { RoutersService } from './routers.service';
import { CreateRouterDto } from './dto/create-router.dto';
import { UpdateRouterDto } from './dto/update-router.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Routers')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('routers')
export class RoutersController {
  constructor(
    private readonly routersService: RoutersService,
  ) {}

  // ==================================================
  // =================== Get All ======================
  // ==================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all routers',
    description: 'Returns all routers together with their Asset, Rack, Building, and Site information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Routers retrieved successfully.',
  })
  async findAll() {
    return this.routersService.findAll();
  }

  // ==================================================
  // ================= Get By Site ====================
  // ==================================================

  @Get('site/:siteId')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all routers in a specific site',
    description: 'Returns all routers whose associated Asset belongs to the specified site.',
  })
  @ApiParam({
    name: 'siteId',
    description: 'UUID of the site.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Routers retrieved successfully.',
  })
  async findBySite(
    @Param('siteId', ParseUUIDPipe) siteId: string,
  ) {
    return this.routersService.findBySite(
      siteId,
    );
  }

  // ==================================================
  // =================== Get One ======================
  // ==================================================

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a router',
    description: 'Returns a router together with its Asset, Rack, Building, and Site information.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the router.',
  })
  @ApiResponse({
    status: 200,
    description: 'Router retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Router not found.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routersService.findOne(
      id,
    );
  }

  // ==================================================
  // =================== Create =======================
  // ==================================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a router',
    description: 'Creates a router together with its Asset record. The router code and asset code are generated automatically.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Router created successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request data or asset type.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Rack, asset type, status, or user not found.',
  })
  async create(
    @Body() dto: CreateRouterDto,
    @Req() request: Request,
  ) {
    const user = request.user as User;

    return this.routersService.create(
      dto,
      user.id,
    );
  }

  // ==================================================
  // =================== Update =======================
  // ==================================================

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a router',
    description:
      'Updates the router Asset information.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the router.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Router updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Router or status not found.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRouterDto,
    @Req() request: Request,
  ) {
    const user = request.user as User;

    return this.routersService.update(
      id,
      dto,
      user.id,
    );
  }

  // ==================================================
  // =================== Delete =======================
  // ==================================================

  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a router',
    description: 'Deletes the router and its associated Asset record.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the router.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Router deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Router not found.',
  })
  async remove(
    @Param('id', ParseUUIDPipe)
    id: string,
  ): Promise<{message: string}> {
    return this.routersService.remove(id);
  }
}