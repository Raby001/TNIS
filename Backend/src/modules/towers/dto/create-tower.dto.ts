import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { GeometryDto } from 'src/common/dto/geometry.dto';

export class CreateTowerDto {

  // ========================================================
  // Asset
  // ========================================================

  @ApiProperty({
    example: 'Phnom Penh Tower 01',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'tower-asset-type-uuid',
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
    description: 'Site where the tower is located.',
  })
  @IsUUID()
  siteId: string;

  @ApiPropertyOptional({
    example: 'Tower supporting telecom equipment.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'TOWER-TAG-001',
    description: 'Physical asset tag or label.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SN-TOWER-001',
    description: 'Manufacturer serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: '2026-08-01',
    description: 'Date when the tower was purchased.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Date when the tower was installed.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Start date of the tower warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2028-08-15',
    description: 'End date of the tower warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @ApiProperty({
    type: GeometryDto,
    description: 'Geographic location of the tower. Must be Point geometry.',
    example: {
      type: 'Point',
      coordinates: [104.91725, 11.5624],
    },
  })
  @ValidateNested()
  @Type(() => GeometryDto)
  geometry: GeometryDto;

  // ========================================================
  // Tower
  // ========================================================

  @ApiPropertyOptional({
    example: 45.5,
    description: 'Tower height in meters.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  heightM?: number;

  @ApiPropertyOptional({
    example: 'Telecom Cambodia',
  })
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional({
    example: 'Reinforced concrete foundation.',
  })
  @IsOptional()
  @IsString()
  foundation?: string;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Maximum supported tower load.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumLoad?: number;

  @ApiPropertyOptional({
    example: 2500,
    description: 'Currently occupied tower capacity.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  occupiedSpace?: number;

  @ApiPropertyOptional({
    example: 2500,
    description: 'Currently available tower capacity.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  availableSpace?: number;

  @ApiPropertyOptional({
    example: 'Grid + Generator',
  })
  @IsOptional()
  @IsString()
  power?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  generator?: boolean;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  battery?: boolean;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  gps?: boolean;

  @ApiPropertyOptional({
    example: '2030-12-31',
  })
  @IsOptional()
  @IsDateString()
  leaseExpiry?: string;
}