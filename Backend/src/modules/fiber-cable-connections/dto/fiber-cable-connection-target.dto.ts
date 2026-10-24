import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { FiberCableConnectionTargetType } from '../entities/fiber-cable-connection.entity';

export class FiberCableConnectionTargetDto {
  @ApiProperty({
    enum: FiberCableConnectionTargetType,
    example: FiberCableConnectionTargetType.ASSET,
    description: 'Determines whether the fiber cable connects to a specific asset or to a site.',
  })
  @IsEnum(FiberCableConnectionTargetType)
  targetType: FiberCableConnectionTargetType;

  @ApiPropertyOptional({
    example: '93466faf-c5e8-4d47-9b83-5a287fc5d92e',
    description: 'UUID of the connected asset. Required when targetType is ASSET.',
  })
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @ApiPropertyOptional({
    example: '5d5c9e0a-1234-4567-8901-abcdef123456',
    description:'UUID of the connected site. Required when targetType is SITE.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;
}