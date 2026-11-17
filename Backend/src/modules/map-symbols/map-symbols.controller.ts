import { Controller, Delete, Get, Param, ParseUUIDPipe, Put, UploadedFile, UseGuards, UseInterceptors, Request, BadRequestException } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags,} from '@nestjs/swagger';

import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';

import { MapSymbolsService } from './map-symbols.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';

const uploadDirectory = join(
  process.cwd(),
  'uploads',
  'map-symbols',
);

mkdirSync(uploadDirectory, {
  recursive: true,
});

const iconUploadInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: uploadDirectory,
    filename: (_request, file, callback) => {
      const extension = extname(file.originalname).toLowerCase();

      callback(
        null,
        `${randomUUID()}${extension}`,
      );
    },
  }),

  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (_request, file, callback) => {
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'Only PNG, JPEG, and WebP images are allowed.',
        ),
        false,
      );
    }

    callback(null, true);
  },
});

@ApiTags('Map Symbols')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('map-symbols')
export class MapSymbolsController {
  constructor(
    private readonly mapSymbolsService: MapSymbolsService,
  ) {}

  // =========================================================
  // Asset type icons
  // =========================================================

  @Get('asset-types')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get icons for all asset types',
  })
  findAllAssetTypeIcons() {
    return this.mapSymbolsService.findAllAssetTypeIcons();
  }

  @Get('asset-types/:assetTypeId')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get an asset type icon',
  })
  findAssetTypeIcon(
    @Param('assetTypeId', ParseUUIDPipe) assetTypeId: string,
  ) {
    return this.mapSymbolsService.findAssetTypeIcon(assetTypeId);
  }

  @Put('asset-types/:assetTypeId')
  @Permissions('MAP_SYMBOL_ASSET_TYPE_UPDATE')
  @UseInterceptors(iconUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })  
  @ApiOperation({
    summary: 'Upload or replace an asset type icon',
  })
  updateAssetTypeIcon(
    @Param('assetTypeId', ParseUUIDPipe) assetTypeId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() request: any,
  ) {
    if (!file) {
      throw new BadRequestException('Icon file is required.');
    }

    return this.mapSymbolsService.updateAssetTypeIcon(
      assetTypeId,
      file,
      request.user.id,
    );
  }

  @Delete('asset-types/:assetTypeId')
  @Permissions('MAP_SYMBOL_ASSET_TYPE_UPDATE')
  @ApiOperation({
    summary: 'Reset an asset type icon',
  })
  resetAssetTypeIcon(
    @Param('assetTypeId', ParseUUIDPipe) assetTypeId: string,
  ) {
    return this.mapSymbolsService.resetAssetTypeIcon(assetTypeId);
  }

  // =========================================================
  // Global default site icon
  // =========================================================

  @Get('sites/default')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get the global default site icon',
  })
  findDefaultSiteIcon() {
    return this.mapSymbolsService.findDefaultSiteIcon();
  }

  @Put('sites/default')
  @Permissions('MAP_SYMBOL_SITE_DEFAULT_UPDATE')
  @UseInterceptors(iconUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Change the global default site icon',
  })
  updateDefaultSiteIcon(
    @UploadedFile() file: Express.Multer.File,
    @Request() request: any,
  ) {
    if (!file) {
      throw new BadRequestException('Icon file is required.');
    }

    return this.mapSymbolsService.updateDefaultSiteIcon(
      file,
      request.user.id,
    );
  }

  // =========================================================
  // Individual site icon
  // =========================================================

  @Get('sites/:siteId')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get the effective icon of a site',
    description: 'Returns the individual override when one exists; otherwise returns the global default.',
  })
  findSiteIcon(
    @Param('siteId', ParseUUIDPipe) siteId: string,
  ) {
    return this.mapSymbolsService.findSiteIcon(siteId);
  }

  @Put('sites/:siteId')
  @Permissions('MAP_SYMBOL_SITE_OVERRIDE_UPDATE')
  @UseInterceptors(iconUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Set an individual site icon override',
  })
  updateSiteIcon(
    @Param('siteId', ParseUUIDPipe) siteId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() request: any,
  ) {
    if (!file) {
      throw new BadRequestException('Icon file is required.');
    }

    return this.mapSymbolsService.updateSiteIcon(
      siteId,
      file,
      request.user.id,
    );
  }

  @Delete('sites/:siteId')
  @Permissions('MAP_SYMBOL_SITE_OVERRIDE_UPDATE')
  @ApiOperation({
    summary: 'Remove an individual site icon override',
    description: 'The site will use the global default icon again.',
  })
  resetSiteIcon(
    @Param('siteId', ParseUUIDPipe) siteId: string,
  ) {
    return this.mapSymbolsService.resetSiteIcon(siteId);
  }
}