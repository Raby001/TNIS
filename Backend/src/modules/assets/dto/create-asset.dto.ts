import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { GeometryDto } from 'src/common/dto/geometry.dto';

export class CreateAssetDto {
  @ApiProperty({
    example: 'Sihanoukville Tower 01',
    description: 'Human-readable name of the asset.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'uuid-of-asset-type',
    description: 'ID of the asset type, for example Tower, Pole, Manhole, or Fiber Cable.',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiPropertyOptional({
    example: 'uuid-of-lifecycle-status',
    description: 'ID of the lifecycle status assigned to the asset.',
  })
  @IsOptional()
  @IsUUID()
  lifecycleStatusId?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-condition',
    description: 'ID of the current condition assigned to the asset.',
  })
  @IsOptional()
  @IsUUID()
  conditionId?: string;

  @ApiProperty({
    example: 'site-uuid',
    description: 'UUID of the Site where the asset is located.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @ApiPropertyOptional({
    example: 'TAG-001',
    description: 'Physical asset tag or label.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SN-123456789',
    description: 'Manufacturer serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: 'Telecom tower located at Sihanoukville.',
    description: 'Additional description of the asset.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '2026-08-01',
    description: 'Date when the asset was purchased.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Date when the asset was installed.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Start date of the asset warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-08-15',
    description: 'End date of the asset warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @ApiPropertyOptional({
    example: 'Huawei',
    description: 'Manufacturer of the asset.',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({
    example: 'MA5800-X7',
    description: 'Model of the asset.',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    type: GeometryDto,
    description: 'Geographic location of the asset. For point assets such as towers, poles, and manholes, use a GeoJSON Point.',
    example: {
      type: 'Point',
      coordinates: [103.8567, 13.3619],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeometryDto)
  geometry?: GeometryDto;

}