import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword123!',
    description: 'The user current password.',
  })
  @IsString()
  @MinLength(5)
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'The new password.',
  })
  @IsString()
  @MinLength(5)
  newPassword: string;
}