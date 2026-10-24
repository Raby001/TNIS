import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FiberCablesService } from './fiber-cable.service';
import { CreateFiberCableDto } from './dto/create-fiber-cable.dto';
import { NearbyAssetsQueryDto } from './entities/nearby-assets-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { UpdateFiberCableDto } from './dto/update-fiber-cable.dto';
@ApiTags('Fiber Cables')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fiber-cables')
export class FiberCablesController {
  constructor(
    private readonly fiberCablesService: FiberCablesService,
  ) {}

  // =============================================
  // =================== Post
  // =============================================
  
  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a fiber cable',
    description: 'Creates a fiber cable asset and automatically creates all individual fiber cores based on the selected core count.',
  })
  @ApiResponse({
    status: 201,
    description: 'Fiber cable and its fiber cores were created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid geometry or request data.',
  })
  @ApiResponse({
    status: 404,
    description: 'One of the referenced records does not exist.',
  })
  async create(
    @Body() dto: CreateFiberCableDto,
    @Req() request: Request,
  ) {
    const user = request.user as User;
    
    return this.fiberCablesService.create(
      dto,
      user.id,
    );
  }

  // =============================================
  // =================== Get
  // =============================================
  
  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all fiber cables',
    description: 'Returns all fiber cables together with their asset information and fiber cable details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Fiber cables retrieved successfully.',
  })
  async findAll() {
    return this.fiberCablesService.findAll();
  }

  // =============================================
  // Find a nearby asset that can be connect to fiber cable
  // =============================================

  @Get('nearby-assets')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Find nearby assets that can connect to fiber',
    description: 'Returns nearby point assets that are allowed to connect to a fiber cable, ordered by distance.',
  })
  @ApiResponse({
    status: 200,
    description: 'Nearby connectable assets returned successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid coordinates or query parameters.',
  })
  async findNearbyAssets(
    @Query() query: NearbyAssetsQueryDto,
  ) {
    return this.fiberCablesService.findNearbyAssets(query);
  }

  // =============================================
  // Get all core of a fiber cable
  // =============================================


  @Get(':id/cores')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get fiber cores',
    description: 'Returns all fiber cores belonging to a fiber cable together with their statuses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Fiber cores retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Fiber cable not found.',
  })
  async findCores( @Param('id') id: string,) {
    return this.fiberCablesService.findCores(id);
  }

  // =============================================
  // Get all the connection of a fiber cable
  // =============================================

  @Get(':id/connections')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all direct connections of a fiber cable',
  })
  @ApiParam({
    name: 'id',
    description: 'Fiber cable Asset ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the fiber cable endpoints, splice closures, and directly connected fiber cables.',
  })
  @ApiResponse({
    status: 404,
    description: 'Fiber cable not found.',
  })
  async findConnections(@Param('id', ParseUUIDPipe) id: string) {
    return this.fiberCablesService.findConnections(id);
  }

  // =============================================
  // Get fiber cable by id
  // =============================================

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a fiber cable',
    description: 'Returns a fiber cable together with its asset information and fiber cores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Fiber cable retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Fiber cable not found.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fiberCablesService.findOne(id);
  }

  // =============================================
  // Update fiber cable
  // =============================================

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a fiber cable',
    description: 'Updates the fiber cable asset information and fiber cable properties. Core count and physical endpoints cannot be changed through this operation.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fiber cable Asset ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Fiber cable updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid update data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Fiber cable or referenced record not found.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFiberCableDto,
    @Req() request: { user: User },
  ) {
    return this.fiberCablesService.update(
      id,
      dto,
      request.user.id,
    );
  }


  // =============================================
  // =================== Delete
  // =============================================

  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a fiber cable',
    description: 'Deletes a fiber cable and its associated asset. Fiber cores and fiber cable connections are automatically deleted through cascading relationships.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fiber cable Asset ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Fiber cable deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Fiber cable not found.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.fiberCablesService.remove(id);
  }

}