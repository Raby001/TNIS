import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ExportKmzQueryDto {
  @ApiPropertyOptional({
    description: 'Filter assets by asset type ID.',
  })
  @IsOptional()
  @IsUUID()
  assetTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter assets by status ID.',
  })
  @IsOptional()
  @IsUUID()
  statusId?: string;

  @ApiPropertyOptional({
    description: 'Filter assets by site ID.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @ApiPropertyOptional({
    description: 'Filter assets by province ID.',
  })
  @IsOptional()
  @IsUUID()
  provinceId?: string;

  @ApiPropertyOptional({
    description: 'Filter assets by city ID.',
  })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({
    description:
      'Search by asset code, asset name, asset tag, or serial number.',
    example: 'POP01',
  })
  @IsOptional()
  @IsString()
  search?: string;
}