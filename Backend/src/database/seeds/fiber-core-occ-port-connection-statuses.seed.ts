import { DataSource } from 'typeorm';
import { FiberCoreOccPortConnectionStatus } from 'src/modules/fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection-status.entity';

export async function seedFiberCoreOccPortConnectionStatuses(dataSource: DataSource): Promise<void> {

  const repo = dataSource.getRepository(FiberCoreOccPortConnectionStatus);

  const statuses = [
    {
      code: 'ACTIVE',
      name: 'Active',
      description: 'The fiber core OCC port connection is active.',
    },

    {
      code: 'DISCONNECTED',
      name: 'Disconnected',
      description: 'The fiber core OCC port connection is disconnected.',
    },
  ];

  for (const status of statuses) {

    const existing =
      await repo.findOne({
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
    'Fiber Core OCC Port Connection Statuses seeding is completed.',
  );
}