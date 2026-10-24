import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { FiberCoreSide } from 'src/modules/cables/enums/fiber-core-side.enum';

export class CreateFiberSpliceConnectionDto {

  @ApiProperty({
    example: '18941eb6-a6df-434c-b145-00ed333f1300',
    description: 'UUID of the source fiber core.',
  })
  @IsUUID()
  sourceCoreId: string;

  @ApiProperty({
    enum: FiberCoreSide,
    example: FiberCoreSide.END,
    description: 'Side of the source fiber core used by the splice.',
  })
  @IsEnum(FiberCoreSide)
  sourceCoreSide: FiberCoreSide;

  @ApiProperty({
    example: 'a26ba20c-7245-4701-a932-c8c1f4353439',
    description: 'UUID of the destination fiber core.',
  })
  @IsUUID()
  destinationCoreId: string;

  @ApiProperty({
    enum: FiberCoreSide,
    example: FiberCoreSide.START,
    description: 'Side of the destination fiber core used by the splice.',
  })
  @IsEnum(FiberCoreSide)
  destinationCoreSide: FiberCoreSide;
}