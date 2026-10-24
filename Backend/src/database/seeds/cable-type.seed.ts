import { CableType } from 'src/modules/cables/entities/cable-type.entity';
import { DataSource } from 'typeorm';

export async function seedCableTypes(dataSource: DataSource,): Promise<void> {
  
  const cableTypeRepository = dataSource.getRepository(CableType);

  const cableTypes = [
    {
      code: 'G652D',
      name: 'G.652D',
      description: 'Single-mode optical fiber type G.652D.',
    },
    {
      code: 'G657A1',
      name: 'G.657A1',
      description:
        'Bend-insensitive single-mode optical fiber type G.657A1.',
    },
    {
      code: 'G655',
      name: 'G.655',
      description:
        'Non-zero dispersion-shifted single-mode optical fiber type G.655.',
    },
  ];

  for (const cableType of cableTypes) {
    const existing = await cableTypeRepository.findOne({
      where: {
        code: cableType.code,
      },
    });

    if (existing) {
      continue;
    }

    await cableTypeRepository.save(cableType);
  }
  console.log('Cable Type seeded successfully.');

}