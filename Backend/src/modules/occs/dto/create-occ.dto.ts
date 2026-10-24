import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreateOccDto {

  // =======================================================
  // Asset fields
  // =======================================================

  @ApiProperty({
    example: 'OCC PP-001',
    description: 'Name of the OCC asset.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'occ-asset-type-uuid',
    description: 'UUID of the OCC asset type.',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiProperty({
    example: 'active-status-uuid',
    description: 'UUID of the asset status.',
  })
  @IsUUID()
  statusId: string;

  @ApiProperty({
    example: 'site-uuid',
    description: 'UUID of the Site where the OCC is located.',
  })
  @IsUUID()
  siteId: string;

  @ApiPropertyOptional({
    example: 'Optical cross-connect point at the telecommunications site.',
    description: 'Asset description.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // =======================================================
  // Geometry
  // =======================================================

  @ApiProperty({
    type: PointGeometryDto,
    description:
      'Geographic location of the OCC. Must be Point geometry.',
    example: {
      type: 'Point',
      coordinates: [103.523, 10.625],
    },
  })
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry: PointGeometryDto;

  // =======================================================
  // Physical identification
  // =======================================================

  @ApiPropertyOptional({
    example: 'OCC-TAG-001',
    description: 'Physical asset tag or label.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'OCC-SN-001',
    description: 'Manufacturer serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  // =======================================================
  // OCC-specific information
  // =======================================================
  @ApiPropertyOptional({
    example: 48,
    description: 'Total number of optical ports available on the OCC.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  portCount?: number;

  // =======================================================
  // Lifecycle
  // =======================================================

  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Date when the OCC was purchased.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-10',
    description: 'Date when the OCC was installed.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-10',
    description: 'Start date of the OCC warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-09-10',
    description: 'End date of the OCC warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

}