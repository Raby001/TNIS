import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FiberCableConnectionRole, FiberCableConnectionTargetType } from '../entities/fiber-cable-connection.entity';

export class CreateFiberCableConnectionDto {

  @ApiProperty({
    example: '18941eb6-a6df-434c-b145-00ed333f1300',
  })
  @IsUUID()
  fiberCableId: string;

  @ApiProperty({
    enum: FiberCableConnectionTargetType,
    example: FiberCableConnectionTargetType.ASSET,
    description: 'Determines whether the fiber cable connects to a specific asset or only to a site.',
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
    description: 'UUID of the connected site. Required when targetType is SITE.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;
  
  @ApiProperty({
    enum: FiberCableConnectionRole,
    example: FiberCableConnectionRole.START,
    description: 'Role of the connection. START and END represent cable endpoints. MIDDLE represents any intermediate asset along the cable.',
  })
  @IsEnum(FiberCableConnectionRole)
  connectionRole: FiberCableConnectionRole;
}