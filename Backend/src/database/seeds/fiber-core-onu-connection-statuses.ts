import { DataSource } from 'typeorm';
import { FiberCoreOnuConnectionStatus } from 'src/modules/fiber-core-onu-connections/entities/fiber-core-onu-connection-status.entity';

export async function seedFiberCoreOnuConnectionStatuses(dataSource: DataSource): Promise<void> {
  
  const repo = dataSource.getRepository(FiberCoreOnuConnectionStatus);

  const statuses = [
    {
      code: 'ACTIVE',
      name: 'Active',
      description: 'The fiber core ONU connection is active.',
    },
    {
      code: 'DISCONNECTED',
      name: 'Disconnected',
      description: 'The fiber core ONU connection is disconnected.',
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
    'Fiber Core ONU Connection Statuses seeding is completed.',
  );
}