import { DataSource } from 'typeorm';
import { AssetCondition } from 'src/modules/assets/entities/asset-condition.entity';

export async function seedAssetConditions(
  dataSource: DataSource,
): Promise<void> {
  const repository = dataSource.getRepository(AssetCondition);

  const conditions = [
    {
      name: 'Excellent',
      description: 'Asset is in excellent physical condition.',
    },
    {
      name: 'Good',
      description: 'Asset is in good physical condition with no significant issues.',
    },
    {
      name: 'Fair',
      description: 'Asset has minor wear or issues but remains usable.',
    },
    {
      name: 'Poor',
      description: 'Asset has significant wear or physical issues and may require attention.',
    },
    {
      name: 'Damaged',
      description: 'Asset has physical damage that may affect its usability or operation.',
    },
  ];

  for (const condition of conditions) {
    const existing = await repository.findOne({
      where: {
        name: condition.name,
      },
    });

    if (existing) {
      continue;
    }

    await repository.save(
      repository.create(condition),
    );
  }

  console.log('Asset conditions seeded.');
}