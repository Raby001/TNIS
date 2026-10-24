import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateBuildingDto {
  @ApiPropertyOptional({
    example: 'Main Telecom Building',
    description: 'Updated name of the building.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    example: 'Main building for network equipment.',
    description: 'Updated description of the building.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}