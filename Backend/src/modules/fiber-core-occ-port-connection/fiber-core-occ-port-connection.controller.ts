import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import { FiberCoreOccPortConnection } from './entities/fiber-core-occ-port-connection.entity';
import { FiberCoreOccPortConnectionService } from './fiber-core-occ-port-connection.service';
import { CreateFiberCoreOccPortConnectionDto } from './dto/create-fiber-core-occ-port-connection.dto';

@ApiTags('Fiber Core OCC Port Connections')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fiber-core-occ-port-connections')
export class FiberCoreOccPortConnectionController {

  constructor(
    private readonly service: FiberCoreOccPortConnectionService,
  ) {}

  // ========================================================
  // Find All
  // ========================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all fiber core OCC port connections',
  })
  @ApiResponse({
    status: 200,
    description:
      'Fiber core OCC port connections retrieved successfully.',
  })
  findAll(): Promise<FiberCoreOccPortConnection[]> {
    return this.service.findAll();
  }

  // ========================================================
  // Find By OCC Port
  // ========================================================

  @Get('port/:occPortId')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get connections for an OCC port',
  })
  @ApiParam({
    name: 'occPortId',
    description: 'UUID of the OCC port.',
    type: String,
    format: 'uuid',
  })
  findByOccPort(
    @Param('occPortId', ParseUUIDPipe)
    occPortId: string,
  ): Promise<FiberCoreOccPortConnection[]> {
    return this.service.findByOccPort(occPortId);
  }

  // ========================================================
  // Find One
  // ========================================================

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a fiber core OCC port connection',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the OCC port connection.',
    type: String,
    format: 'uuid',
  })
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ): Promise<FiberCoreOccPortConnection> {
    return this.service.findOne(id);
  }

  // ========================================================
  // Create
  // ========================================================

  @Post()
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Connect a fiber core side to an OCC port',
  })
  @ApiResponse({
    status: 201,
    description:
      'Fiber core OCC port connection created successfully.',
  })
  create(
    @Body()
    dto: CreateFiberCoreOccPortConnectionDto,
  ): Promise<FiberCoreOccPortConnection> {
    return this.service.create(dto);
  }

  // ========================================================
  // Disconnect
  // ========================================================

  @Patch(':id/disconnect')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Disconnect a fiber core from an OCC port',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the OCC port connection.',
    type: String,
    format: 'uuid',
  })
  disconnect(
    @Param('id', ParseUUIDPipe)
    id: string,
  ): Promise<FiberCoreOccPortConnection> {
    return this.service.disconnect(id);
  }
}