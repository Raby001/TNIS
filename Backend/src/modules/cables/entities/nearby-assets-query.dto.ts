import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class NearbyAssetsQueryDto {
  @ApiProperty({
    example: 11.5624,
    description: 'Latitude of the selected map location.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    example: 104.9173,
    description: 'Longitude of the selected map location.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({
    example: 1000,
    default: 1000,
    description: 'Search radius in meters.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  radius: number = 1000;

  @ApiPropertyOptional({
    example: 5,
    description: 'Maximum number of assets to return. If omitted, all matching assets within the radius are returned.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: 'site-uuid',
    description: 'Optional site ID to limit suggestions to one site.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;
}