import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/access-control/guards/permissions.guard';
import { Permissions } from 'src/modules/access-control/decorators/permissions.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { HandholesService } from './handholes.service';
import { Handhole } from './entities/handhole.entity';
import { CreateHandholeDto } from './dto/create-handhole.dto';
import { UpdateHandholeDto } from './dto/update-handhole.dto';

@ApiTags('Handholes')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('handholes')
export class HandholesController {
  constructor(
    private readonly handholesService: HandholesService,
  ) {}

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a handhole',
  })
  async create(
    @Body() dto: CreateHandholeDto,
    @Req() request: { user: User },
  ): Promise<Handhole> {
    return this.handholesService.create(
      dto,
      request.user.id,
    );
  }

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all handholes',
  })
  async findAll(): Promise<Handhole[]> {
    return this.handholesService.findAll();
  }

  @Get(':assetId')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a handhole',
  })
  @ApiParam({
    name: 'assetId',
    description: 'UUID of the handhole.',
    type: String,
    format: 'uuid',
  })
  async findOne(
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ): Promise<Handhole> {
    return this.handholesService.findOne(assetId);
  }

  @Patch(':assetId')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a handhole',
  })
  @ApiParam({
    name: 'assetId',
    description: 'UUID of the handhole.',
    type: String,
    format: 'uuid',
  })
  async update(
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Body() dto: UpdateHandholeDto,
    @Req() request: { user: User },
  ): Promise<Handhole> {
    return this.handholesService.update(
      assetId,
      dto,
      request.user.id,
    );
  }

  @Delete(':assetId')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a handhole',
  })
  @ApiParam({
    name: 'assetId',
    description: 'UUID of the handhole.',
    type: String,
    format: 'uuid',
  })
  async remove(
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ): Promise<{message: string}> {
    return this.handholesService.remove(assetId);
  }
}