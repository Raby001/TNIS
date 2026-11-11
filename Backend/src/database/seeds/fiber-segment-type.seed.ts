import { DataSource } from 'typeorm';
import { FiberSegmentType } from 'src/modules/cables/entities/fiber-segment-type.entity';

export async function seedFiberSegmentTypes(dataSource: DataSource): Promise<void> {

  const repository = dataSource.getRepository(FiberSegmentType);

  const segmentTypes = [
    {
      code: 'BACKBONE',
      name: 'Backbone',
      sortOrder: 1,
      description:
        'Fiber cable forming the backbone network and connecting major network locations such as POPs.',
    },
    {
      code: 'DISTRIBUTION_METRO',
      name: 'Distribution Network (Metro)',
      sortOrder: 2,
      description:
        'Fiber cable forming the metropolitan distribution network and connecting the backbone to distribution-side network assets.',
    },
    {
      code: 'ACCESS_NETWORK',
      name: 'Access Network',
      sortOrder: 3,
      description:
        'Fiber cable connecting the distribution network to access-side network assets such as NAPs and other access infrastructure.',
    },
    {
      code: 'LAST_MILE',
      name: 'Last Mile',
      sortOrder: 4,
      description:
        'Fiber cable connecting access network infrastructure to the customer premises or end-user equipment.',
    },
  ];

  for (const segmentType of segmentTypes) {
    const existing = await repository.findOne({
      where: {
        code: segmentType.code,
      },
    });

    if (existing) {
      existing.name = segmentType.name;
      existing.description = segmentType.description;
      existing.sortOrder = segmentType.sortOrder;

      await repository.save(existing);
      continue;
    }

    await repository.save(
      repository.create(segmentType),
    );
  }
}