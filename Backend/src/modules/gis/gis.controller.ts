import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { GisService } from './gis.service';
import { ExportKmzQueryDto } from './dto/export-kmz-query.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';

@ApiTags('GIS')
@Controller('gis')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GisController {
  constructor(
    private readonly gisService: GisService,
  ) {}

  // =========================================================
  // EXPORT KMZ
  // =========================================================

  @Get('export/kmz')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Export network assets and sites as KMZ',
    description:
      'Exports sites and assets with GIS geometry into a KMZ file that can be opened in Google Earth.',
  })
  @ApiProduces('application/vnd.google-earth.kmz')
  @ApiResponse({
    status: 200,
    description: 'KMZ file generated successfully.',
    content: {
      'application/vnd.google-earth.kmz': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ASSET_READ permission.',
  })
  async exportKmz(
    @Query() query: ExportKmzQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    const kmz = await this.gisService.exportKmz(query);

    response.setHeader(
      'Content-Type',
      'application/vnd.google-earth.kmz',
    );

    response.setHeader(
      'Content-Disposition',
      'attachment; filename="telecom-network-inventory.kmz"',
    );

    response.setHeader(
      'Content-Length',
      kmz.length,
    );

    response.end(kmz);
  }
}