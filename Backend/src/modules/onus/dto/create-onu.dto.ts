import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsMACAddress, IsNumber, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GeometryDto } from 'src/common/dto/geometry.dto';
import { CreateCustomerDto } from 'src/modules/customers/dto/create-customer.dto';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreateOnuDto {
  @ApiProperty({
    example: 'Customer ONU 001',
    description: 'ONU asset name.',
  })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Asset type ID for the ONU.',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Asset status ID.',
  })
  @IsUUID()
  statusId: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Site ID where the ONU is installed.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @ApiPropertyOptional({
    example: 'TAG-ONU-001',
    description: 'Asset tag.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'ONU-SN-001',
    description: 'ONU serial number.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @ApiPropertyOptional({
    example: 'ONU installed at customer premises.',
    description: 'Asset description.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Purchase date.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-05',
    description: 'Installation date.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-05',
    description: 'Warranty start date.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-09-05',
    description: 'Warranty end date.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @ApiProperty({
    example: {
      type: 'Point',
      coordinates: [104.9282, 11.5564],
    },
    type: PointGeometryDto,
    description: 'ONU location. Must be a Point geometry using [longitude, latitude].',
  })
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry: PointGeometryDto;

  @ApiPropertyOptional({
    example: '02:42:ac:11:00:02',
    description: 'ONU MAC address.',
  })
  @IsOptional()
  @IsMACAddress()
  macAddressONU?: string;

  @ApiPropertyOptional({
    example: '02:42:ac:11:00:02',
    description: 'Router MAC address.',
  })
  @IsOptional()
  @IsMACAddress()
  macAddressRouter?: string;

  @ApiPropertyOptional({
    example: 'GPON',
    description: 'PON technology used by the ONU.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
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
    example: '94907d2a-1291-4833-bf74-5031f4b72574',
    description: 'Existing customer ID. Use this when assigning the ONU to an existing customer.',
  })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({
    type: CreateCustomerDto,
    description: 'New customer information. Use this when creating a new customer together with the ONU.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customer?: CreateCustomerDto;
}