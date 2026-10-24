import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min, } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UserQueryDto {
  @ApiPropertyOptional({
    example: 'john',
    description: 'Search by username or full name.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter users by role ID.',
  })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Filter users by province ID.',
  })
  @IsOptional()
  @IsUUID()
  provinceId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter users by active status.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'createdAt',
    enum: ['username', 'fullName', 'createdAt', 'updatedAt'],
    default: 'createdAt',
    description: 'Field used to sort the results.',
  })
  @IsOptional()
  @IsIn(['username', 'fullName', 'createdAt', 'updatedAt'])
  sortBy?: 'username' | 'fullName' | 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiPropertyOptional({
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    description: 'Sort direction.',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    default: 1,
    description: 'Page number.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    description: 'Number of users per page.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}