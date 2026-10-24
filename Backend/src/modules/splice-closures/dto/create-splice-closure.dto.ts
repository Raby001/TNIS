import {ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {IsDateString, IsInt, IsOptional, IsString, IsUUID,Min, ValidateNested } from 'class-validator';
import { GeometryDto } from 'src/common/dto/geometry.dto';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreateSpliceClosureDto {
  // ==========================
  // Asset fields
  // ==========================

  @ApiProperty({
    example: 'Splice Closure SHV-001',
    description: 'Name of the splice closure asset.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '1767eb7c-3be8-45c6-8973-4d25b049b8d2',
    description: 'UUID of the splice closure asset type.',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiProperty({
    example: 'f39554f5-9004-4173-8a79-59f8380b304d',
    description: 'UUID of the asset status.',
  })
  @IsUUID()
  statusId: string;

  @ApiProperty({
    example: 'site-uuid',
    description:
      'UUID of the Site where the fiber cable belongs.',
  })
  @IsUUID()
  siteId: string;

  @ApiPropertyOptional({
    example: 'Splice closure installed along the main fiber route.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: PointGeometryDto,
    description: 'Geographic location of the splice closure. Must be Point geometry.',
    example: {
      type: 'Point',
      coordinates: [103.523, 10.625],
    },
  })
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry: PointGeometryDto;


  @ApiPropertyOptional({
    example: 'SC-TAG-001',
    description: 'Physical asset tag or label.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SC-SN-001',
    description: 'Manufacturer serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: '2026-08-01',
    description: 'Date when the splice closure was purchased.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Date when the splice closure was installed.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Start date of the warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-08-15',
    description: 'End date of the warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  // ==========================
  // Splice Closure fields
  // ==========================

  @ApiProperty({
    example: 'DOME',
    description: 'Type of splice closure.',
  })
  @IsString()
  closureType: string;

  @ApiPropertyOptional({
    example: 48,
    description: 'Maximum number of fiber cores supported.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}