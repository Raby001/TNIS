import { DataSource } from 'typeorm';
import { Status } from 'src/modules/assets/entities/status.entity';

export async function seedStatuses(dataSource: DataSource): Promise<void> {
  const statusRepository = dataSource.getRepository(Status);

  const statuses = [
    {
      name: 'Planned',
      description: 'Asset is planned but not yet installed.',
    },
    {
      name: 'Installed',
      description: 'Asset has been physically installed.',
    },
    {
      name: 'In Service',
      description: 'Asset is currently active and operational.',
    },
    {
      name: 'Under Maintenance',
      description: 'Asset is currently under maintenance.',
    },
    {
      name: 'Faulty',
      description: 'Asset has been identified as faulty/broken.',
    },
    {
      name: 'Decommissioned',
      description: 'Asset has been permanently taken out of service',
    },
  ];

  for (const status of statuses) {
    const existing = await statusRepository.findOne({
      where: {
        name: status.name,
      },
    });

    if (existing) {
      continue;
    }

    await statusRepository.save(
      statusRepository.create(status),
    );
  }

  console.log('Statuses seeded.');
}