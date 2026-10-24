import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateRackDto {

  // ========================================================
  // Asset
  // ========================================================

  @ApiPropertyOptional({
    example: 'Core Network Rack 01',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
  
  @ApiPropertyOptional({
    example: 'available-status-uuid',
  })
  @IsOptional()
  @IsUUID()
  statusId?: string;

  @ApiPropertyOptional({
    example: 'Rack containing core network equipment.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // ========================================================
  // Physical Identification
  // ========================================================

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

  // ========================================================
  // Lifecycle
  // ========================================================

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