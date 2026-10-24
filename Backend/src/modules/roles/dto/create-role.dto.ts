import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'MANAGER',
    description: 'Unique name of the role.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Manages users and system operations.',
    description: 'Description of the role.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    ],
    description: 'Permission IDs assigned to this role.',
    type: [String],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}