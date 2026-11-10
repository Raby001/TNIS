import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class MapQueryDto {

  // ========================================================
  // Common Map Filters
  // ========================================================
    
  @ApiPropertyOptional({
    description: 'Map layers to return. If omitted, all supported layers are returned. Ex: FIBER_CABLE, HANDHOLE, MANHOLE, NAP, OCC, ONU, POLE, SITE, SPLICE_CLOSURE, TOWER',
  })
  @IsOptional()
  @IsString()
  types?: string;

  @ApiPropertyOptional({
    description: 'Search map features by code, name, asset tag, serial number, or other supported identifying fields.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter map features by province. Asset-based features are filtered through their site location.',
  })
  @IsOptional()
  @IsUUID()
  provinceId?: string;

  @ApiPropertyOptional({
    description: 'Filter map features by city. Asset-based features are filtered through their site location.',
  })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({
    description: 'Filter map features by site.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @ApiPropertyOptional({
    description: 'Filter asset-based map features by asset life cycle status.',
  })
  @IsOptional()
  @IsUUID()
  lifecycleStatusId?: string;

  @ApiPropertyOptional({
    description: 'Filter asset-based map features by asset condition.',
  })
  @IsOptional()
  @IsUUID()
  conditionId?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of features returned per layer.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  limit?: number;


  // ========================================================
  // Fiber Cable Filters
  // ========================================================

  @ApiPropertyOptional({
    description: 'Filter fiber cables by fiber core count.',
  })
  @IsOptional()
  @IsUUID()
  coreCountId?: string;

  @ApiPropertyOptional({
    description: 'Filter fiber cables by segment type, such as TRANSPORT, DISTRIBUTION, or ACCESS.',
  })
  @IsOptional()
  @IsUUID()
  segmentTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter fiber cables by cable type.',
  })
  @IsOptional()
  @IsUUID()
  cableTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter fiber cables by installation method.',
  })
  @IsOptional()
  @IsUUID()
  installationMethodId?: string;


  // ========================================================
  // ONT Filters
  // ========================================================

  @ApiPropertyOptional({
    description: 'Filter ONTs by customer.',
  })
  @IsOptional()
  @IsUUID()
  customerId?: string;

}