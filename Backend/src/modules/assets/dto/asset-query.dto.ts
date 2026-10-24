import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, Min,} from 'class-validator';

export class AssetQueryDto {
  // =========================
  // Search
  // =========================

  @ApiPropertyOptional({
    example: 'RTR-PP',
    description:'Search by asset code, name, asset tag, or serial number.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // =========================
  // Filters
  // =========================

  @ApiPropertyOptional({
    example: '0198f2c4-1234-7abc-8def-123456789abc',
    description: 'Filter by asset type UUID.',
  })
  @IsOptional()
  @IsUUID()
  assetTypeId?: string;

  @ApiPropertyOptional({
    example: '0198f2c4-1234-7abc-8def-123456789abc',
    description: 'Filter by status UUID.',
  })
  @IsOptional()
  @IsUUID()
  statusId?: string;

  @ApiPropertyOptional({
    example: '0198f2c4-1234-7abc-8def-123456789abc',
    description: 'Filter by site UUID.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;

  // =========================
  // Date filters
  // =========================

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Return assets created on or after this date.',
  })
  @IsOptional()
  @IsISO8601()
  createdFrom?: string;

  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Return assets created on or before this date.',
  })
  @IsOptional()
  @IsISO8601()
  createdTo?: string;

  // =========================
  // Sorting
  // =========================

  @ApiPropertyOptional({
    example: 'createdAt',
    default: 'createdAt',
    description: 'Field used to sort the results.',
    enum: [
      'code',
      'name',
      'createdAt',
      'updatedAt',
      'purchaseDate',
      'installationDate',
    ],
  })
  @IsOptional()
  @IsIn([
    'code',
    'name',
    'createdAt',
    'updatedAt',
    'purchaseDate',
    'installationDate',
  ])
  sortBy:
    | 'code'
    | 'name'
    | 'createdAt'
    | 'updatedAt'
    | 'purchaseDate'
    | 'installationDate' = 'createdAt';

  @ApiPropertyOptional({
    example: 'DESC',
    default: 'DESC',
    enum: ['ASC', 'DESC'],
    description: 'Sort direction.',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  // =========================
  // Pagination
  // =========================

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Page number.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    description: 'Number of assets returned per page.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}