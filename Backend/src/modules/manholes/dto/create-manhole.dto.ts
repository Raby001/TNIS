import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString, IsUUID, IsNumber, Min, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreateManholeDto {
  @ApiProperty({
    example: 'Manhole PP 001',
    description: 'Manhole name.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Asset type ID for the manhole.',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiPropertyOptional({
    example: 'Huawei',
    description: 'Manufacturer of the ONU.',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({
    example: 'EG8145V5',
    description: 'Model of the ONU.',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    example: 'uuid-of-lifecycle-status',
    description: 'ID of the asset lifecycle status.',
  })
  @IsUUID()
  lifecycleStatusId: string;

  @ApiProperty({
    example: 'uuid-of-condition',
    description: 'ID of the asset condition.',
  })
  @IsUUID()
  conditionId: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Site associated with the manhole.',
  })
  @IsUUID()
  siteId: string;

  @ApiPropertyOptional({
    example: 2.5,
    description: 'Manhole depth in meters.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depthM?: number;

  @ApiPropertyOptional({
    example: 'Concrete',
    description: 'Manhole material.',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    example: 'Cast Iron',
    description: 'Manhole cover type.',
  })
  @IsOptional()
  @IsString()
  coverType?: string;

  @ApiPropertyOptional({
    example: 'MH-TAG-001',
    description: 'Asset tag.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'MH-SN-001',
    description: 'Serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: 'Manhole description.',
    description: 'Description.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '2026-02-01',
    description: 'Purchase date.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-05',
    description: 'Installation date.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-05',
    description: 'Warranty start date.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-02-05',
    description: 'Warranty end date.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @ApiProperty({
    type: PointGeometryDto,
    description: 'Location geometry of the asset.',
    example: {
      type: 'Point',
      coordinates: [104.9173, 11.5624],
    },
  })
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry: PointGeometryDto;

}