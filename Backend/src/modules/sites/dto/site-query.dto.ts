import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SiteQueryDto {
  @ApiPropertyOptional({
    example: 'Phnom Penh',
    description:
      'Search by site code, name, address, city name, or province name.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'city-uuid',
    description: 'Filter sites by city.',
  })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Page number.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: 'Number of sites per page.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}