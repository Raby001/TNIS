import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreateSiteDto {
  @ApiProperty({
    example: '1767eb7c-3be8-45c6-8973-4d25b049b8d2',
    description: 'UUID of the city where the site is located.',
  })
  @IsUUID()
  cityId: string;

  @ApiProperty({
    example: 'Takhmao Site 01',
    description: 'Name of the site.',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Takhmao, Kandal Province, Cambodia',
    description: 'Physical address of the site.',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 18.5,
    description: 'Elevation of the site above sea level in meters.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  elevation?: number;

  @ApiPropertyOptional({
    example: 'Telecommunication site in Takhmao.',
    description: 'Additional information about the site.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: PointGeometryDto,
    description:
      'Geographic location of the site. Sites use Point geometry.',
    example: {
      type: 'Point',
      coordinates: [104.772, 11.483],
    },
  })
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry: PointGeometryDto;
}