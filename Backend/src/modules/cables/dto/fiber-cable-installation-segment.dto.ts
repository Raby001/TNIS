import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FiberCableConnectionTargetDto } from 'src/modules/fiber-cable-connections/dto/fiber-cable-connection-target.dto';

export class FiberCableInstallationSegmentDto {
  @ApiProperty({
    type: FiberCableConnectionTargetDto,
    description: 'Target where this installation-method segment begins. The target must be one of this fiber cable route targets.',
  })
  @ValidateNested()
  @Type(() => FiberCableConnectionTargetDto)
  fromTarget: FiberCableConnectionTargetDto;

  @ApiProperty({
    type: FiberCableConnectionTargetDto,
    description: 'Target where this installation-method segment ends. The target must be one of this fiber cable route targets.',
  })
  @ValidateNested()
  @Type(() => FiberCableConnectionTargetDto)
  toTarget: FiberCableConnectionTargetDto;

  @ApiProperty({
    example: '3db27e4b-b2dc-410a-a078-9fe4cf8cef9d',
    description: 'Installation method used for this route segment.',
  })
  @IsUUID()
  installationMethodId: string;
}