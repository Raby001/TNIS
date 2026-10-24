import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { FiberCoreSide } from '../../cables/enums/fiber-core-side.enum';

export class CreateFiberCoreOnuConnectionDto {

  @ApiProperty({
    description: 'Fiber core ID on the last-mile fiber cable.',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @IsUUID()
  fiberCoreId: string;

  @ApiProperty({
    description:
      'The side of the fiber core that is physically connected to the ONU.',
    enum: FiberCoreSide,
    example: FiberCoreSide.END,
  })
  @IsEnum(FiberCoreSide)
  fiberCoreSide: FiberCoreSide;

  @ApiProperty({
    description: 'ONU asset ID.',
    example: '22222222-2222-2222-2222-222222222222',
  })
  @IsUUID()
  onuAssetId: string;
}