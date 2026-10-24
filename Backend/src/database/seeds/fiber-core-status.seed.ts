import { FiberCoreStatus } from 'src/modules/cables/entities/fiber-core-status.entity';
import { DataSource } from 'typeorm';

export async function seedFiberCoreStatuses( dataSource: DataSource,): Promise<void> {
  
  const fiberCoreStatusRepository = dataSource.getRepository(FiberCoreStatus);

  const fiberCoreStatuses = [
    {
      code: 'AVAILABLE',
      name: 'Available',
      colorName: 'Green',
      colorHex: '#22C55E',
      description: 'Core is available for use.',
    },
    {
      code: 'IN_USE',
      name: 'In Use',
      colorName: 'Blue',
      colorHex: '#3B82F6',
      description: 'Core is currently being used.',
    },
    {
      code: 'RESERVED',
      name: 'Reserved',
      colorName: 'Yellow',
      colorHex: '#EAB308',
      description: 'Core is reserved but not currently in use.',
    },
    {
      code: 'DAMAGED',
      name: 'Damaged',
      colorName: 'Red',
      colorHex: '#EF4444',
      description: 'Core is damaged and cannot currently be used.',
    },
    {
      code: 'RETIRED',
      name: 'Retired',
      colorName: 'Gray',
      colorHex: '#6B7280',
      description: 'Core is permanently out of service.',
    },
  ];

  for (const fiberCoreStatus of fiberCoreStatuses) {
    const existing = await fiberCoreStatusRepository.findOne({
      where: {
        code: fiberCoreStatus.code,
      },
    });

    if (existing) {
      continue;
    }

    await fiberCoreStatusRepository.save(fiberCoreStatus);
  }

  console.log('Fiber core status is seeded successfully.')
}