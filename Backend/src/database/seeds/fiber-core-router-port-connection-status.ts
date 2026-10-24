import { FiberCoreRouterPortConnectionStatus } from 'src/modules/fiber-core-router-port-connections/entities/fiber-core-router-port-connection-status.entity';
import { DataSource } from 'typeorm';

export async function seedFiberCoreRouterPortConnectionStatuses(dataSource: DataSource): Promise<void> {
  
  const repo = dataSource.getRepository(FiberCoreRouterPortConnectionStatus);

  const statuses = [
    {
      code: 'ACTIVE',
      name: 'Active',
      description:
        'The fiber core router port connection is active.',
    },
    {
      code: 'DISCONNECTED',
      name: 'Disconnected',
      description:
        'The fiber core router port connection is disconnected.',
    },
  ];

  for (const status of statuses) {
    const existing = await repo.findOne({
      where: {
        code: status.code,
      },
    });

    if (!existing) {
      await repo.save(
        repo.create(status),
      );
    }
  }

  console.log(
    'Fiber Core Router Port Connection Statuses seeding is completed.',
  );
}