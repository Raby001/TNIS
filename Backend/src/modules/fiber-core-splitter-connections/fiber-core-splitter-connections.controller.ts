import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FiberCoreSplitterConnectionsService } from './fiber-core-splitter-connections.service';
import { CreateFiberCoreSplitterConnectionDto } from './dto/create-fiber-core-splitter-connection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';

@ApiTags('Fiber Core Splitter Connections')
@ApiBearerAuth('JWT')
@UseGuards( JwtAuthGuard, PermissionsGuard)
@Controller('fiber-core-splitter-connections')
export class FiberCoreSplitterConnectionsController {

  constructor(
    private readonly service: FiberCoreSplitterConnectionsService,
  ) {}

  // ========================================================
  // Create
  // ========================================================

  @Post()
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Connect a fiber core side to an optical splitter input',
  })
  create(
    @Body()
    dto: CreateFiberCoreSplitterConnectionDto,
  ) {
    return this.service.create(dto);
  }

  // ========================================================
  // Find All
  // ========================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all fiber core splitter connections',
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
    summary: 'Get a fiber core splitter connection',
  })
  @ApiParam({
    name: 'id',
    description: 'Fiber core splitter connection UUID',
  })
  findOne(
    @Param('id') id: string,
  ) {
    return this.service.findOne(id);
  }

  // ========================================================
  // Disconnect
  // ========================================================

  @Post(':id/disconnect')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Disconnect a fiber core from an optical splitter input',
  })
  disconnect(
    @Param('id') id: string,
  ) {
    return this.service.disconnect(id);
  }
}