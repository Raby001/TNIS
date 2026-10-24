import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsUUID } from 'class-validator';

export class ConvertFieldObservationDto {
  @ApiProperty({
    example: '8f7d4c0e-2e2e-4e3e-9a2d-123456789abc',
    description: 'Asset Type selected for conversion. The selected Asset Type must use Point geometry.',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiProperty({
    type: Object,
    description: 'Fields required by the selected Asset Type creation DTO. The backend validates these fields according to the selected Asset Type.',
    example: {
      name: 'Unknown Cabinet - Converted',
      statusId: 'status-uuid',
      siteId: 'site-uuid',
      assetTag: 'TAG-001',
      manufacturer: 'Huawei',
      model: 'Example Model',
    },
  })
  @IsObject()
  details: Record<string, unknown>;
}