import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName: string;

  @ApiProperty({
    description: 'Unique username used for login',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  username: string;

  @ApiProperty({
    description: 'Password used for login',
    minLength: 5,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  password: string;

  @ApiProperty({
    description: 'ID of the role assigned to the user',
  })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({
    description: 'ID of the province assigned to the user',
  })
  @IsUUID()
  @IsNotEmpty()
  provinceId: string;
}