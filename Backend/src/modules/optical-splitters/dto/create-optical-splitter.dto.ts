import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreateOpticalSplitterDto {

  // ========================================================
  // Asset Information
  // ========================================================

  @ApiProperty({
    example: 'asset-type-uuid',
    description: 'Asset type ID for Optical Splitter.',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiProperty({
    example: 'status-uuid',
    description: 'Asset status ID.',
  })
  @IsUUID()
  statusId: string;

  @ApiProperty({
    example: 'site-uuid',
    description: 'Site where the optical splitter is located.',
  })
  @IsUUID()
  siteId: string;

  @ApiProperty({
    example: 'Splitter PP-001',
    description: 'Name of the optical splitter.',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'Optical splitter installed inside LCP.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'SPL-PP-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SPL-SN-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @ApiPropertyOptional({
    example: '2026-08-01',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-08-15',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @ApiPropertyOptional({
    description: 'Geographic location of the optical splitter.',
  })
  @IsOptional()
  geometry?: PointGeometryDto;

  // ========================================================
  // Optical Splitter Information
  // ========================================================


  @ApiProperty({
    example: 'lcp-or-nap-asset-uuid',
    description:
      'Optional Asset ID of the LCP or NAP that contains this optical splitter.',
  })
  @IsOptional()
  @IsUUID()
  parentAssetId: string;

  @ApiProperty({
    example: 'uuid-of-1-8-ratio',
    description: 'Splitter ratio to use for this optical splitter.',
  })
  @IsUUID()
  splitterRatioId: string;
}