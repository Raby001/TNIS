import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateFiberCableInstallationSegmentDto {
  @ApiProperty({
    example: '3db27e4b-b2dc-410a-a078-9fe4cf8cef9d',
    description: 'Installation method to apply to this fiber cable segment.',
  })
  @IsUUID()
  installationMethodId: string;
}