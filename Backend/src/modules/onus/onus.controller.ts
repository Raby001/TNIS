import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/access-control/guards/permissions.guard';
import { Permissions } from 'src/modules/access-control/decorators/permissions.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { OnusService } from './onus.service';
import { CreateOnuDto } from './dto/create-onu.dto';
import { UpdateOnuDto } from './dto/update-onu.dto';
import { Onu } from './entities/onu.entity';
import type { Request } from 'express';

@ApiTags('ONUs')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('onus')
export class OnusController {
  constructor(
    private readonly onusService: OnusService,
  ) {}

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create an ONU',
  })
  @ApiResponse({
    status: 201,
    description: 'ONU created successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer, asset type, status, or site not found.',
  })
  async create(
    @Body() dto: CreateOnuDto,
    @Req() req: Request,
  ): Promise<Onu> {
    const user = req.user as User;
    return this.onusService.create(
      dto,
      user.id,
    );
  }

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all ONUs',
  })
  async findAll(): Promise<Onu[]> {
    return this.onusService.findAll();
  }

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get an ONU',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the ONU.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 404,
    description: 'ONU not found.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Onu> {
    return this.onusService.findOne(id);
  }

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update an ONU',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the ONU.',
    type: String,
    format: 'uuid',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnuDto,
    @Req() req: Request,
  ): Promise<Onu> {
    const user = req.user as User;
    return this.onusService.update(
      id,
      dto,
      user.id,
    );
  }

  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete an ONU',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the ONU.',
    type: String,
    format: 'uuid',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{message: string}> {
    return this.onusService.remove(id);
  }
}