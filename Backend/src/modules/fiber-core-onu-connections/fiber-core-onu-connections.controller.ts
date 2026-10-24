import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FiberCoreOnuConnectionsService } from './fiber-core-onu-connections.service';
import { CreateFiberCoreOnuConnectionDto } from './dto/create-fiber-core-onu-connection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';

@ApiTags('Fiber Core ONU Connections')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fiber-core-onu-connections')
export class FiberCoreOnuConnectionsController {
  constructor(
    private readonly service: FiberCoreOnuConnectionsService,
  ) {}

  // ========================================================
  // Create
  // ========================================================

  @Post()
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Connect a fiber core side to an ONU',
  })
  create(
    @Body()
    dto: CreateFiberCoreOnuConnectionDto,
  ) {
    return this.service.create(dto);
  }

  // ========================================================
  // Find All
  // ========================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all fiber core ONU connections',
  })
  findAll() {
    return this.service.findAll();
  }

  // ========================================================
  // Find One
  // ========================================================

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a fiber core ONU connection',
  })
  @ApiParam({
    name: 'id',
    description: 'Fiber core ONU connection UUID',
  })
  findOne(
    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.service.findOne(id);
  }

  // ========================================================
  // Disconnect
  // ========================================================

  @Post(':id/disconnect')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Disconnect a fiber core from an ONU',
  })
  @ApiParam({
    name: 'id',
    description: 'Fiber core ONU connection UUID',
  })
  disconnect(
    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.service.disconnect(id);
  }
}