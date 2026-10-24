import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { FieldObservationStatus } from '../entities/field-observation.entity';

export class FieldObservationQueryDto {
  @ApiPropertyOptional({
    example: 'cabinet',
    description: 'Search by observation name or description.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: FieldObservationStatus,
    example: FieldObservationStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(FieldObservationStatus)
  status?: FieldObservationStatus;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Filter by the user who created the observation.',
  })
  @IsOptional()
  @IsUUID()
  createdById?: string;
}