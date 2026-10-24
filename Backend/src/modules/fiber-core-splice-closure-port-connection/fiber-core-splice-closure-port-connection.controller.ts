import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import { FiberCoreSpliceClosurePortConnection } from './entities/fiber-core-splice-closure-port-connection.entity';
import { CreateFiberCoreSpliceClosurePortConnectionDto } from './dto/create-fiber-core-splice-closure-port-connection.dto';
import { FiberCoreSpliceClosurePortConnectionsService } from './fiber-core-splice-closure-port-connection.service';

@ApiTags('Fiber Core - Splice Closure Port Connections')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fiber-core-splice-closure-port-connections')
export class FiberCoreSpliceClosurePortConnectionsController {
  constructor(
    private readonly service: FiberCoreSpliceClosurePortConnectionsService,
  ) {}

  // =========================================================
  // Get All
  // =========================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary:'Get all Fiber Core - Splice Closure Port connections',
  })
  @ApiResponse({
    status: 200,
    description:'Connections retrieved successfully.',
  })
  async findAll(): Promise<FiberCoreSpliceClosurePortConnection[]> {
    return this.service.findAll();
  }

  // =========================================================
  // Get One
  // =========================================================

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary:'Get a Fiber Core - Splice Closure Port connection',
  })
  @ApiParam({
    name: 'id',
    description: 'Connection UUID.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description:'Connection retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Connection not found.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FiberCoreSpliceClosurePortConnection> {
    return this.service.findOne(id);
  }

  // =========================================================
  // Create
  // =========================================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary:'Connect a Fiber Core to a Splice Closure Port',
    description:'Creates an active connection between a Fiber Core side and a Splice Closure Port.',
  })
  @ApiResponse({
    status: 201,
    description:'Connection created successfully.',
  })
  async create(
    @Body() dto: CreateFiberCoreSpliceClosurePortConnectionDto,
  ): Promise<FiberCoreSpliceClosurePortConnection> {
    return this.service.create(dto);
  }

  // =========================================================
  // Disconnect
  // =========================================================

  @Patch(':id/disconnect')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary:'Disconnect a Fiber Core from a Splice Closure Port',
  })
  @ApiParam({
    name: 'id',
    description: 'Connection UUID.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description:'Connection disconnected successfully.',
  })
  async disconnect(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FiberCoreSpliceClosurePortConnection> {
    return this.service.disconnect(id);
  }

  // =========================================================
  // Get by Fiber Core
  // =========================================================

  @Get('fiber-core/:fiberCoreId')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary:'Get connections by Fiber Core',
  })
  @ApiParam({
    name: 'fiberCoreId',
    description: 'Fiber Core UUID.',
    type: String,
    format: 'uuid',
  })
  async findByFiberCore(
    @Param('fiberCoreId', ParseUUIDPipe) fiberCoreId: string,
  ): Promise<FiberCoreSpliceClosurePortConnection[]> {
    return this.service.findByFiberCore(fiberCoreId);
  }

  // =========================================================
  // Get by Splice Closure Port
  // =========================================================

  @Get('splice-closure-port/:spliceClosurePortId')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary:'Get connections by Splice Closure Port',
  })
  @ApiParam({
    name: 'spliceClosurePortId',
    description:'Splice Closure Port UUID.',
    type: String,
    format: 'uuid',
  })
  async findBySpliceClosurePort(
    @Param('spliceClosurePortId',ParseUUIDPipe) spliceClosurePortId: string,
  ): Promise<FiberCoreSpliceClosurePortConnection[]> {
    return this.service.findBySpliceClosurePort(
      spliceClosurePortId,
    );
  }
}