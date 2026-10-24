import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { FiberCoreSide } from 'src/modules/cables/enums/fiber-core-side.enum';

export class CreateFiberCoreSpliceClosurePortConnectionDto {
  @ApiProperty({
    example: 'fiber-core-uuid',
  })
  @IsUUID()
  fiberCoreId: string;

  @ApiProperty({
    enum: FiberCoreSide,
    example: FiberCoreSide.END,
  })
  @IsEnum(FiberCoreSide)
  fiberCoreSide: FiberCoreSide;

  @ApiProperty({
    example: 'splice-closure-port-uuid',
  })
  @IsUUID()
  spliceClosurePortId: string;
}