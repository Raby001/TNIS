import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateFiberSpliceDto } from './create-fiber-splice.dto';


export class CreateFiberSpliceBulkDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateFiberSpliceDto)
  @ApiProperty({
    type: [CreateFiberSpliceDto],
  })
  connections: CreateFiberSpliceDto[];
}