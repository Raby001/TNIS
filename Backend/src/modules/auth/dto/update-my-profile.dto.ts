import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateMyProfileDto {
  @ApiPropertyOptional({
    example: 'Mr. Xyz',
    description: 'Updated full name.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @ApiPropertyOptional({
    example: 'john.doe',
    description: 'Updated username.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @ApiPropertyOptional({
    example: 'e510a9e1-fd4e-456d-ba2c-30689ac43814',
    description: 'Updated province ID.',
  })
  @IsOptional()
  @IsUUID()
  provinceId?: string;
}