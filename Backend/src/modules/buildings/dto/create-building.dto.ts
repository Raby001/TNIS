import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBuildingDto {

  @ApiProperty({
    example: 'Main Telecom Building',
    description: 'Name of the building.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'site-uuid',
    description: 'UUID of the site where the building is located.',
  })
  @IsUUID()
  siteId: string;

  @ApiPropertyOptional({
    example: 'Main building for network equipment.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}