import { DataSource } from 'typeorm';
import { Province } from 'src/modules/locations/entities/province.entity';
import { Geometry } from 'src/common/types/geometry.type';

export async function seedProvinces( dataSource: DataSource ): Promise<void> {
  
  const repository = dataSource.getRepository(Province);

  const provinces: {
    name: string;
    code: string;
    geometry: Geometry;
  }[] = [
    {
      name: 'Banteay Meanchey',
      code: 'BMC',
      geometry: {
        type: 'Point',
        coordinates: [102.9896, 13.5859],
      },
    },
    {
      name: 'Battambang',
      code: 'BTB',
      geometry: {
        type: 'Point',
        coordinates: [103.1956, 13.0957],
      },
    },
    {
      name: 'Kampong Cham',
      code: 'KPC',
      geometry: {
        type: 'Point',
        coordinates: [105.4639, 11.9934],
      },
    },
    {
      name: 'Kampong Chhnang',
      code: 'KCH',
      geometry: {
        type: 'Point',
        coordinates: [104.6695, 12.2502],
      },
    },
    {
      name: 'Kampong Speu',
      code: 'KPS',
      geometry: {
        type: 'Point',
        coordinates: [104.5646, 11.4533],
      },
    },
    {
      name: 'Kampong Thom',
      code: 'KTH',
      geometry: {
        type: 'Point',
        coordinates: [104.8885, 12.2546],
      },
    },
    {
      name: 'Kampot',
      code: 'KPT',
      geometry: {
        type: 'Point',
        coordinates: [104.1814, 10.6104],
      },
    },
    {
      name: 'Kandal',
      code: 'KDL',
      geometry: {
        type: 'Point',
        coordinates: [104.9486, 11.4833],
      },
    },
    {
      name: 'Kep',
      code: 'KEP',
      geometry: {
        type: 'Point',
        coordinates: [104.2888, 10.4829],
      },
    },
    {
      name: 'Koh Kong',
      code: 'KKG',
      geometry: {
        type: 'Point',
        coordinates: [103.4964, 11.6153],
      },
    },
    {
      name: 'Kratie',
      code: 'KRT',
      geometry: {
        type: 'Point',
        coordinates: [106.0197, 12.4881],
      },
    },
    {
      name: 'Mondulkiri',
      code: 'MDK',
      geometry: {
        type: 'Point',
        coordinates: [107.1967, 12.4558],
      },
    },
    {
      name: 'Oddar Meanchey',
      code: 'ODM',
      geometry: {
        type: 'Point',
        coordinates: [103.9085, 14.1618],
      },
    },
    {
      name: 'Pailin',
      code: 'PAI',
      geometry: {
        type: 'Point',
        coordinates: [102.6093, 12.8489],
      },
    },
    {
      name: 'Phnom Penh',
      code: 'PP',
      geometry: {
        type: 'Point',
        coordinates: [104.9282, 11.5564],
      },
    },
    {
      name: 'Preah Sihanouk',
      code: 'SHV',
      geometry: {
        type: 'Point',
        coordinates: [103.5234, 10.6255],
      },
    },
    {
      name: 'Preah Vihear',
      code: 'PVH',
      geometry: {
        type: 'Point',
        coordinates: [104.7108, 13.8060],
      },
    },
    {
      name: 'Prey Veng',
      code: 'PVG',
      geometry: {
        type: 'Point',
        coordinates: [105.3240, 11.4868],
      },
    },
    {
      name: 'Pursat',
      code: 'PUR',
      geometry: {
        type: 'Point',
        coordinates: [103.9180, 12.5388],
      },
    },
    {
      name: 'Ratanakiri',
      code: 'RAT',
      geometry: {
        type: 'Point',
        coordinates: [106.9970, 13.7394],
      },
    },
    {
      name: 'Siem Reap',
      code: 'SRP',
      geometry: {
        type: 'Point',
        coordinates: [103.8558, 13.3633],
      },
    },
    {
      name: 'Stung Treng',
      code: 'STG',
      geometry: {
        type: 'Point',
        coordinates: [105.9690, 13.5259],
      },
    },
    {
      name: 'Svay Rieng',
      code: 'SVR',
      geometry: {
        type: 'Point',
        coordinates: [105.9800, 11.0879],
      },
    },
    {
      name: 'Takeo',
      code: 'TKO',
      geometry: {
        type: 'Point',
        coordinates: [104.7985, 10.9908],
      },
    },
    {
      name: 'Tbong Khmum',
      code: 'TBK',
      geometry: {
        type: 'Point',
        coordinates: [105.8840, 11.8860],
      },
    },
  ];
  
  for (const province of provinces) {
    const existing = await repository.findOne({
      where: {
        code: province.code,
      },
    });

    if (existing) {
      existing.name = province.name;
      existing.geometry = province.geometry;

      await repository.save(existing);
      continue;
    }

    await repository.save(
      repository.create(province),
    );
  }

  console.log('Provinces seeded.');
}