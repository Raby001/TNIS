import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateFiberSpliceDto {
  @ApiProperty({
    example: 'splice-closure-port-a-uuid',
    description: 'UUID of the first splice closure port.',
  })
  @IsUUID()
  spliceClosurePortAId: string;

  @ApiProperty({
    example: 'splice-closure-port-b-uuid',
    description: 'UUID of the second splice closure port.',
  })
  @IsUUID()
  spliceClosurePortBId: string;
}