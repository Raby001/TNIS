import { DataSource } from 'typeorm';
import { FiberCoreSplitterConnectionStatus } from '../../modules/fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';

export async function seedFiberCoreSplitterConnectionStatuses(
  dataSource: DataSource,
): Promise<void> {

  const repository = dataSource.getRepository(FiberCoreSplitterConnectionStatus);

  const statuses = [
    {
      code: 'ACTIVE',
      name: 'Active',
      description:
        'Fiber core is actively connected to an optical splitter input.',
    },

    {
      code: 'DISCONNECTED',
      name: 'Disconnected',
      description:
        'Fiber core splitter connection has been disconnected.',
    },
  ];

  for (const data of statuses) {

    const existing =
      await repository.findOne({
        where: {
          code: data.code,
        },
      });

    if (existing) {
      continue;
    }

    await repository.save(
      repository.create(data),
    );
  }

  console.log(
    'Fiber core splitter connection statuses seeded successfully.',
  );
}