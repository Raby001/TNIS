import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { FiberCoreSide } from '../../cables/enums/fiber-core-side.enum';

export class CreateFiberCoreRouterPortConnectionDto {

  @ApiProperty({
    example: 'fiber-core-uuid',
  })
  @IsUUID()
  fiberCoreId: string;

  @ApiProperty({
    enum: FiberCoreSide,
    example: FiberCoreSide.START,
  })
  @IsEnum(FiberCoreSide)
  fiberCoreSide: FiberCoreSide;

  @ApiProperty({
    example: 'router-port-uuid',
  })
  @IsUUID()
  routerPortId: string;
}