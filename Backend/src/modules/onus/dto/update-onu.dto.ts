import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsMACAddress, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateOnuDto {
  @ApiPropertyOptional({
    example: 'Customer ONU 001',
    description: 'Updated ONU name.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Updated asset status ID.',
  })
  @IsOptional()
  @IsUUID()
  statusId?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Updated customer ID.',
  })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({
    example: 'AA:BB:CC:DD:EE:FF',
    description: 'Updated ONU MAC address.',
  })
  @IsOptional()
  @IsMACAddress()
  macAddressONU?: string;

  @ApiPropertyOptional({
    example: 'AA:BB:CC:DD:EE:FF',
    description: 'Updated Router MAC address.',
  })
  @IsOptional()
  @IsMACAddress()
  macAddressRouter?: string;


  @ApiPropertyOptional({
    example: 'GPON',
    description: 'Updated PON technology.',
  })
  @IsOptional()
  @IsString()
  ponType?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Customer download speed in Mbps.',
  })
  @IsOptional()
  @IsNumber()
  downloadSpeedMbps?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Customer upload speed in Mbps.',
  })
  @IsOptional()
  @IsNumber()
  uploadSpeedMbps?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Customer data allowance in GB.',
  })
  @IsOptional()
  @IsNumber()
  dataAllowanceGb?: number;

  @ApiPropertyOptional({
    example: 'ONU-TAG-001',
    description: 'Updated asset tag.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'ONU-SN-001',
    description: 'Updated serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: 'Updated ONU description.',
    description: 'Updated description.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '2026-02-01',
    description: 'Updated purchase date.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-05',
    description: 'Updated installation date.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-05',
    description: 'Updated warranty start date.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-02-05',
    description: 'Updated warranty end date.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @ApiPropertyOptional({
    description: 'Updated location geometry of the asset.',
    example: {
      type: 'Point',
      coordinates: [104.9173, 11.5624],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry?: PointGeometryDto;

}