import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RacksService } from './racks.service';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import { User } from '../users/entities/user.entity';
import type { Request } from 'express';

@ApiTags('Racks')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('racks')
export class RacksController {

  constructor(
    private readonly racksService: RacksService,
  ) {}

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a rack',
    description: 'Creates a rack inside an existing building and creates its associated asset.',
  })
  @ApiResponse({
    status: 201,
    description: 'Rack created successfully.',
  })
  async create(
    @Body() dto: CreateRackDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.racksService.create(
      dto,
      user.id,
    );
  }

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all racks',
    description: 'Returns all racks with their associated asset, building, site, and routers.',
  })
  @ApiResponse({
    status: 200,
    description: 'Racks retrieved successfully.',
  })
  async findAll() {
    return this.racksService.findAll();
  }

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a rack by ID',
    description: 'Returns a rack with its associated asset, building, site, and routers.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the rack.',
    example: 'e9c4dfed-776b-43e8-b8e6-12bb487101c4',
  })
  @ApiResponse({
    status: 200,
    description: 'Rack retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Rack not found.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.racksService.findOne(id);
  }

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a rack',
    description: 'Updates the rack asset information. The rack code and building cannot be changed.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the rack.',
    example: 'e9c4dfed-776b-43e8-b8e6-12bb487101c4',
  })
  @ApiResponse({
    status: 200,
    description: 'Rack updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Rack not found.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRackDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.racksService.update(
      id,
      dto,
      user.id,
    );
  }

  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a rack',
    description: 'Deletes a rack and its associated asset.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the rack.',
    example: 'e9c4dfed-776b-43e8-b8e6-12bb487101c4',
  })
  @ApiResponse({
    status: 200,
    description: 'Rack deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Rack not found.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{message: string}> {
    return this.racksService.remove(id);
  }
}