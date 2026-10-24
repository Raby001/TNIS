import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCustomerDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Updated customer name.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    example: '012345678',
    description: 'Updated customer phone number.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Updated customer email address.',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({
    example: 'Phnom Penh, Cambodia',
    description: 'Updated customer address.',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Updated customer information.',
    description: 'Updated customer description.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}