import { DataSource } from 'typeorm';
import { SplitterRatio } from '../../modules/optical-splitters/entities/splitter-ratio.entity';

export async function seedSplitterRatios(dataSource: DataSource): Promise<void> {

  const repository = dataSource.getRepository(SplitterRatio);

  const ratios = [
    {
      ratio: '1:2',
      inputCount: 1,
      outputCount: 2,
      description: '1 input to 2 outputs.',
    },

    {
      ratio: '1:4',
      inputCount: 1,
      outputCount: 4,
      description: '1 input to 4 outputs.',
    },

    {
      ratio: '1:8',
      inputCount: 1,
      outputCount: 8,
      description: '1 input to 8 outputs.',
    },

    {
      ratio: '1:16',
      inputCount: 1,
      outputCount: 16,
      description: '1 input to 16 outputs.',
    },

    {
      ratio: '1:32',
      inputCount: 1,
      outputCount: 32,
      description: '1 input to 32 outputs.',
    },

    {
      ratio: '1:64',
      inputCount: 1,
      outputCount: 64,
      description: '1 input to 64 outputs.',
    },

    {
      ratio: '1:128',
      inputCount: 1,
      outputCount: 128,
      description: '1 input to 128 outputs.',
    },
  ];

  for (const data of ratios) {
    const existing = await repository.findOne({
        where: {
          ratio: data.ratio,
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
    'Splitter ratios seeded successfully.',
  );
}