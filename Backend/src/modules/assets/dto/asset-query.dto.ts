import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, Min,} from 'class-validator';

export class AssetQueryDto {
  // =========================
  // Search
  // =========================

  @ApiPropertyOptional({
    description:'Search by asset code, name, asset tag, or serial number.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // =========================
  // Filters
  // =========================

  @ApiPropertyOptional({
    description: 'Filter by asset type UUID.',
  })
  @IsOptional()
  @IsUUID()
  assetTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by lifecycle status UUID.',
  })
  @IsOptional()
  @IsUUID()
  lifecycleStatusId?: string;

  @ApiPropertyOptional({
    description: 'Filter by asset condition UUID.',
  })
  @IsOptional()
  @IsUUID()
  conditionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by site UUID.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;

  // =========================
  // Date filters
  // =========================

  @ApiPropertyOptional({
    description: 'Return assets created on or after this date.',
  })
  @IsOptional()
  @IsISO8601()
  createdFrom?: string;

  @ApiPropertyOptional({
    description: 'Return assets created on or before this date.',
  })
  @IsOptional()
  @IsISO8601()
  createdTo?: string;

  // =========================
  // Sorting
  // =========================

  @ApiPropertyOptional({
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