import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FiberCoreSide } from '../../cables/enums/fiber-core-side.enum';

export class CreateFiberCoreSplitterConnectionDto {

  @ApiProperty({
    example: 'fiber-core-uuid',
    description: 'UUID of the fiber core connected to the optical splitter port.',
  })
  @IsUUID()
  fiberCoreId: string;

  @ApiProperty({
    enum: FiberCoreSide,
    example: FiberCoreSide.END,
    description: 'Side of the fiber core used for the connection.',
  })
  @IsEnum(FiberCoreSide)
  fiberCoreSide: FiberCoreSide;

  @ApiProperty({
    example: 'optical-splitter-input-port-uuid',
    description: 'UUID of the optical splitter port. The port type (INPUT or OUTPUT) determines the direction of the connection.',
  })
  @IsUUID()
  opticalSplitterPortId: string;
}