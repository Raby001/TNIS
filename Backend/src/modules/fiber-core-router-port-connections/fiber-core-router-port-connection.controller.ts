import { Controller, Delete, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import { FiberCoreRouterPortConnectionService } from './fiber-core-router-port-connection.service';
import { CreateFiberCoreRouterPortConnectionDto } from './dto/create-fiber-core-router-port-connection.dto';

@ApiTags('Fiber Core Router Port Connections')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fiber-core-router-port-connections')
export class FiberCoreRouterPortConnectionController {

  constructor(
    private readonly service: FiberCoreRouterPortConnectionService,
  ) {}

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all fiber core router port connections',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a fiber core router port connection',
  })
  findOne(
    @Param('id') id: string,
  ) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Connect a fiber core to a router port',
  })
  create(
    @Body() dto: CreateFiberCoreRouterPortConnectionDto,
  ) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Disconnect a fiber core from a router port',
  })
  disconnect(
    @Param('id') id: string,
  ) {
    return this.service.disconnect(id);
  }
}