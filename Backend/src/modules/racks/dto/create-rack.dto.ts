import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRackDto {

  @ApiProperty({
    example: 'Core Network Rack 01',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'building-uuid',
  })
  @IsUUID()
  buildingId: string;

  @ApiProperty({
    example: 'rack-asset-type-uuid',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiPropertyOptional({
    example: 'site-uuid',
    description:
      'UUID of the new Site where the asset is located.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @ApiProperty({
    example: 'available-status-uuid',
  })
  @IsUUID()
  statusId: string;

  @ApiPropertyOptional({
    example: 'Rack containing core network equipment.',
  })
  @IsOptional()
  @IsString()
  description?: string;


  @ApiPropertyOptional({
    example: 'TAG-RCK-001',
    description: 'Physical asset tag or label.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SN-RCK-001',
    description: 'Manufacturer serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Date when the rack was purchased.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Date when the rack was installed.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Start date of the rack warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-09-15',
    description: 'End date of the rack warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;
}