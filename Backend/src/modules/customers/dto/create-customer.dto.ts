import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  
  @ApiProperty({
    example: 'John Doe',
    description: 'Customer name.',
  })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    example: '012345678',
    description: 'Customer phone number.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Customer email address.',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({
    example: 'Phnom Penh, Cambodia',
    description: 'Customer address.',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Residential customer.',
    description: 'Additional customer description.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}