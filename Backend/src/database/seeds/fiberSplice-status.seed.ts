import { FiberSpliceStatus } from 'src/modules/fiber-splices/entities/fiber-splice-status.entity';
import { DataSource } from 'typeorm';

export async function seedFiberSpliceStatuses(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(FiberSpliceStatus);

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

  console.log('Fiber Splice Status is completed.')
}