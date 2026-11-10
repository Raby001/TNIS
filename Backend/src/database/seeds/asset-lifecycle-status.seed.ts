import { DataSource } from 'typeorm';
import { AssetLifecycleStatus } from 'src/modules/assets/entities/asset-lifecycle-status.entity';

export async function seedAssetLifecycleStatuses(
  dataSource: DataSource,
): Promise<void> {
  const repository = dataSource.getRepository(AssetLifecycleStatus);

  const lifecycleStatuses = [
    {
      name: 'Planned',
      description: 'Asset is planned but has not entered construction or installation.',
    },
    {
      name: 'Under Construction',
      description: 'Asset is currently being constructed or prepared for installation.',
    },
    {
      name: 'Installed',
      description: 'Asset has been physically installed but may not yet be operational.',
    },
    {
      name: 'Operational',
      description: 'Asset is installed and currently in operational use.',
    },
    {
      name: 'Inactive',
      description: 'Asset is temporarily not in operational use.',
    },
    {
      name: 'Decommissioned',
      description: 'Asset has been permanently removed from service.',
    },
  ];

  for (const lifecycleStatus of lifecycleStatuses) {
    const existing = await repository.findOne({
      where: {
        name: lifecycleStatus.name,
      },
    });

    if (existing) {
      continue;
    }

    await repository.save(
      repository.create(lifecycleStatus),
    );
  }

  console.log('Asset lifecycle statuses seeded.');
}