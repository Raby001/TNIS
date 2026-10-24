import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags,} from '@nestjs/swagger';
import { NapsService } from './naps.service';
import { Nap } from './entities/nap.entity';
import { CreateNapDto } from './dto/create-nap.dto';
import { UpdateNapDto } from './dto/update-nap.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';

@ApiTags('NAPs')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('naps')
export class NapsController {

  constructor(
    private readonly napsService: NapsService,
  ) {}

  // ========================================================
  // Get
  // ========================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all NAPs',
  })
  async findAll(): Promise<Nap[]> {
    return this.napsService.findAll();
  }


  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a NAP',
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<Nap> {
    return this.napsService.findOne(id);
  }

  // ========================================================
  // Create
  // ========================================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a NAP',
  })
  async create(
    @Body() dto: CreateNapDto,
    @Req() request: Request,
  ): Promise<Nap> {
    const user = request.user as User
    return this.napsService.create(dto, user.id);
  }

  // ========================================================
  // Update
  // ========================================================

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a NAP',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNapDto,
    @Req() request: Request,
  ): Promise<Nap> {
    const user = request.user as User;

    return this.napsService.update(
      id,
      dto,
      user.id,
    );
  }
  // ========================================================
  // Delete
  // ========================================================

  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a NAP',
    description: 'Permanently deletes a NAP and its associated asset.',
  })
  @ApiResponse({
    status: 200,
    description: 'NAP deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'NAP not found.',
  })
  async remove(
    @Param('id') id: string,
  ): Promise<{message: string}> {
    return this.napsService.remove(id);
  }
}