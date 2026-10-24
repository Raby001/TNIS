import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username of the user',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'admin',
    description: 'Password of the user',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}