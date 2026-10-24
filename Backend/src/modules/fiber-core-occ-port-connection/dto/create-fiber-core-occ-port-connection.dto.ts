import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { FiberCoreSide } from '../../cables/enums/fiber-core-side.enum';

export class CreateFiberCoreOccPortConnectionDto {

  @ApiProperty({
    description: 'UUID of the fiber core.',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @IsUUID()
  fiberCoreId: string;

  @ApiProperty({
    description:
      'The side of the fiber core connected to the OCC port.',
    enum: FiberCoreSide,
    example: FiberCoreSide.END,
  })
  @IsEnum(FiberCoreSide)
  fiberCoreSide: FiberCoreSide;

  @ApiProperty({
    description: 'UUID of the OCC port.',
    example: '22222222-2222-2222-2222-222222222222',
  })
  @IsUUID()
  occPortId: string;
}