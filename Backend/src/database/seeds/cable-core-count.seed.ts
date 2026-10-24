import { CableCoreCount } from "src/modules/cables/entities/cable-core-count.entity";
import { DataSource } from "typeorm";

export async function seedCableCoreCount (dataSource: DataSource): Promise<void> {

  const CableCoreCountTypeRepository = dataSource.getRepository(CableCoreCount);

  const CableCoreCountType = [
    {
      coreCount: 1,
      displayCode: '1C',
      suggestedColorName: 'Yellow',
      suggestedHex: '#f0ff65',
      confirmRequired: false,
    },
    {
      coreCount: 2,
      displayCode: '2C',
      suggestedColorName: 'Red',
      suggestedHex: '#E53935',
      confirmRequired: false,
    },
    {
      coreCount: 4,
      displayCode: '4C',
      suggestedColorName: 'Blue',
      suggestedHex: '#1E88E5',
      confirmRequired: false,
    },
    {
      coreCount: 8,
      displayCode: '8C',
      suggestedColorName: 'Green',
      suggestedHex: '#43A047',
      confirmRequired: true,
    },
    {
      coreCount: 12,
      displayCode: '12C',
      suggestedColorName: 'Orange',
      suggestedHex: '#FB8C00',
      confirmRequired: true,
    },
    {
      coreCount: 24,
      displayCode: '24C',
      suggestedColorName: 'Purple',
      suggestedHex: '#8E24AA',
      confirmRequired: true,
    },
    {
      coreCount: 48,
      displayCode: '48C',
      suggestedColorName: 'Teal',
      suggestedHex: '#00897B',
      confirmRequired: true,
    },
    {
      coreCount: 96,
      displayCode: '96C',
      suggestedColorName: 'Brown',
      suggestedHex: '#6D4C41',
      confirmRequired: true,
    },
  ]

  for (const ccct of CableCoreCountType) {
    const existing = await CableCoreCountTypeRepository.findOne({
      where: {
        coreCount: ccct.coreCount,
      }
    })

    if(existing) {
      continue;
    }

    await CableCoreCountTypeRepository.save(ccct);

  }

  console.log('Cable core count seeded successfully.');

}