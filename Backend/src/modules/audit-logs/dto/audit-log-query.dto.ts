import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '../entities/audit-log.entity';

const withTimezone = /^\d{4}-\d\d-\d\dT.+(?:Z|[+-]\d\d:\d\d)$/;

export class AuditLogQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  username?: string;

  @ApiPropertyOptional({ enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ example: 'assets' })
  @IsOptional()
  @Matches(/^[a-z][a-z0-9_]{0,62}$/)
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Inclusive ISO timestamp with timezone' })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(withTimezone)
  from?: string;

  @ApiPropertyOptional({ description: 'Exclusive ISO timestamp with timezone' })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(withTimezone)
  to?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  page = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ enum: ['createdAt', 'action', 'entityType', 'username'] })
  @IsIn(['createdAt', 'action', 'entityType', 'username'])
  sortBy: 'createdAt' | 'action' | 'entityType' | 'username' = 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}
