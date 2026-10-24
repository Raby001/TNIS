import { FiberCoreSpliceClosurePortConnectionStatus } from 'src/modules/fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection-status.entity';
import { DataSource } from 'typeorm';

export async function seedFiberCoreSpliceClosurePortConnectionStatuses(dataSource: DataSource): Promise<void> {
  
  const repo = dataSource.getRepository(FiberCoreSpliceClosurePortConnectionStatus);

  const statuses = [
    {
      code: 'ACTIVE',
      name: 'Active',
    },
    {
      code: 'DISCONNECTED',
      name: 'Disconnected',
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
    'Fiber Core Splice Closure Port Connection Statuses seeding is completed.',
  );
}