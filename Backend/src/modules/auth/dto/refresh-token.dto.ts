import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token returned by the login endpoint.',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}