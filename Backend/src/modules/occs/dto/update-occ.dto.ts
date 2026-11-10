import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateOccDto {

  // =======================================================
  // Asset fields
  // =======================================================

  @ApiPropertyOptional({
    example: 'OCC PP-001',
    description: 'Name of the OCC asset.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Huawei',
    description: 'Updated manufacturer of the ONU.',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({
    example: 'EG8145V5',
    description: 'Updated model of the ONU.',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-lifecycle-status',
    description: 'Updated asset lifecycle status.',
  })
  @IsOptional()
  @IsUUID()
  lifecycleStatusId?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-condition',
    description: 'Updated asset condition.',
  })
  @IsOptional()
  @IsUUID()
  conditionId?: string;

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

  @ApiPropertyOptional({
    type: PointGeometryDto,
    description:
      'Geographic location of the OCC. Must be Point geometry.',
    example: {
      type: 'Point',
      coordinates: [103.523, 10.625],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry?: PointGeometryDto;

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

  @ApiPropertyOptional({
    example: 48,
    description: 'Total number of optical ports available on the OCC.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  portCount?: number;
}