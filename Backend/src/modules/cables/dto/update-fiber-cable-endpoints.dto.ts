import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FiberCableConnectionTargetDto } from '../../fiber-cable-connections/dto/fiber-cable-connection-target.dto';

export class UpdateFiberCableEndpointsDto {
  @ApiPropertyOptional({
    type: FiberCableConnectionTargetDto,
    description: 'New START connection target.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FiberCableConnectionTargetDto)
  startTarget?: FiberCableConnectionTargetDto;

  @ApiPropertyOptional({
    type: FiberCableConnectionTargetDto,
    description: 'New END connection target.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FiberCableConnectionTargetDto)
  endTarget?: FiberCableConnectionTargetDto;
}