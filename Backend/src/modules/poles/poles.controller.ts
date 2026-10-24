import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/access-control/guards/permissions.guard';
import { Permissions } from 'src/modules/access-control/decorators/permissions.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { PolesService } from './poles.service';
import { Pole } from './entities/pole.entity';
import { CreatePoleDto } from './dto/create-pole.dto';
import { UpdatePoleDto } from './dto/update-pole.dto';
import type { Request } from 'express';

@ApiTags('Poles')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('poles')
export class PolesController {
  constructor(
    private readonly polesService: PolesService,
  ) {}

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a pole',
  })
  async create(
    @Body() dto: CreatePoleDto,
    @Req() req: Request,
  ): Promise<Pole> {
    const user = req.user as User;
    return this.polesService.create(
      dto,
      user.id,
    );
  }

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all poles',
  })
  async findAll(): Promise<Pole[]> {
    return this.polesService.findAll();
  }

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a pole',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the pole.',
    type: String,
    format: 'uuid',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Pole> {
    return this.polesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a pole',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the pole.',
    type: String,
    format: 'uuid',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePoleDto,
    @Req() req: Request,
  ): Promise<Pole> {
    const user = req.user as User;
    return this.polesService.update(
      id,
      dto,
      user.id,
    );
  }

  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a pole',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the pole.',
    type: String,
    format: 'uuid',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{message: string}> {
    return this.polesService.remove(id);
  }
}