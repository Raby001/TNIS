import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreateNapDto {

  // ========================================================
  // Asset
  // ========================================================

  @ApiProperty({
    example: 'Phnom Penh NAP 01',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'nap-asset-type-uuid',
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
    example: 'ece77f23-798d-4d60-b488-adcf0ba33cad',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @ApiPropertyOptional({
    example: 'NAP serving residential area.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: PointGeometryDto,
    description: 'Location of the NAP.',
    example: {
      type: 'Point',
      coordinates: [
        104.91725,
        11.5624,
      ],
    },
  })
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry: PointGeometryDto;

  // ========================================================
  // NAP
  // ========================================================

  @ApiProperty({
    example: 16,
    description:
      'Number of ports available on the NAP.',
  })
  @IsInt()
  @Min(1)
  capacity: number;

  // ====================================
  // Asset
  // ====================================
  @ApiPropertyOptional({
    example: 'NAP-TAG-001',
    description: 'Physical asset tag or label.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SN-NAP-001',
    description: 'Manufacturer serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: '2026-08-01',
    description: 'Date when the asset was purchased.',
  })
  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Date when the asset was installed.',
  })
  @IsOptional()
  @IsString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Start date of the asset warranty.',
  })
  @IsOptional()
  @IsString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2028-08-15',
    description: 'End date of the asset warranty.',
  })
  @IsOptional()
  @IsString()
  warrantyEnd?: string;
}