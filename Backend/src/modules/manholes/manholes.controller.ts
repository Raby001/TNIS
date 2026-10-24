import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/access-control/guards/permissions.guard';
import { Permissions } from 'src/modules/access-control/decorators/permissions.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { ManholesService } from './manholes.service';
import { Manhole } from './entities/manhole.entity';
import { CreateManholeDto } from './dto/create-manhole.dto';
import { UpdateManholeDto } from './dto/update-manhole.dto';
import type { Request } from 'express';


@ApiTags('Manholes')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('manholes')
export class ManholesController {
  constructor(
    private readonly manholesService: ManholesService,
  ) {}

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a manhole',
  })
  async create(
    @Body() dto: CreateManholeDto,
    @Req() req: Request,
  ): Promise<Manhole> {
    const user = req.user as User;
    return this.manholesService.create(
      dto,
      user.id,
    );
  }

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all manholes',
  })
  async findAll(): Promise<Manhole[]> {
    return this.manholesService.findAll();
  }

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a manhole',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the manhole.',
    type: String,
    format: 'uuid',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Manhole> {
    return this.manholesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a manhole',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the manhole.',
    type: String,
    format: 'uuid',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateManholeDto,
    @Req() req: Request,
  ): Promise<Manhole> {
    const user = req.user as User;
    return this.manholesService.update(
      id,
      dto,
      user.id,
    );
  }

  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a manhole',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the manhole.',
    type: String,
    format: 'uuid',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{message: string}> {
    return this.manholesService.remove(id);
  }
}