import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { FieldObservationsService } from './field-observations.service';
import { CreateFieldObservationDto } from './dto/create-field-observation.dto';
import { UpdateFieldObservationDto } from './dto/update-field-observation.dto';
import { FieldObservationQueryDto } from './dto/field-observation-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import { User } from '../users/entities/user.entity';
import { FieldObservationConversionService } from './providers/field-observation-conversion.service';
import { ConvertFieldObservationDto } from './dto/convert-field-observation.dto';

@ApiTags('Field Observations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('field-observations')
export class FieldObservationsController {
  constructor(
    private readonly fieldObservationsService: FieldObservationsService,
    private readonly fieldObservationConversionService: FieldObservationConversionService,
  ) {}

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a field observation',
    description: 'Creates a temporary field observation. It is not a real network Asset.',
  })
  create(
    @Body() dto: CreateFieldObservationDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.fieldObservationsService.create(
      dto,
      user.id,
    );
  }

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'List field observations',
  })
  findAll(
    @Query() query: FieldObservationQueryDto,
  ) {
    return this.fieldObservationsService.findAll(query);
  }

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a field observation',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.fieldObservationsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a field observation',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFieldObservationDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.fieldObservationsService.update(
      id,
      dto,
      user.id,
    );
  }

  @Post(':id/cancel')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Cancel a field observation',
  })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.fieldObservationsService.cancel(
      id,
      user.id,
    );
  }

  @Post(':id/convert')
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Convert a field observation into a real asset',
    description: 'Atomically creates the selected Point AssetType using the field observation location, then marks the observation as CONVERTED and links it to the created Asset.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Field observation ID.',
  })
  convert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConvertFieldObservationDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;

    return this.fieldObservationConversionService.convert(
      id,
      dto,
      user.id,
    );
  }


  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a field observation',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.fieldObservationsService.remove(id);
  }
}