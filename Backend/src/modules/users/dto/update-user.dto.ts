import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the user.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName?: string;

  @ApiPropertyOptional({
    example: 'john',
    description: 'Unique username used for login.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  username?: string;

  @ApiPropertyOptional({
    example: 'NewPassword@123',
    description: 'New password for the user.',
    minLength: 5,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  password?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the role assigned to the user.',
  })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID of the province assigned to the user.',
  })
  @IsOptional()
  @IsUUID()
  provinceId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the user account is active.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}