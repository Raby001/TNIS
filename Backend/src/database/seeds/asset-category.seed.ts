
import { DataSource } from 'typeorm';
import { AssetCategory } from 'src/modules/assets/entities/asset-category.entity';

export async function seedAssetCategories(
  dataSource: DataSource,
): Promise<void> {
  const repository = dataSource.getRepository(AssetCategory);

  const categories = [
    {
      code: 'CIVIL_INFRASTRUCTURE',
      name: 'Civil Infrastructure',
      description: 'Physical infrastructure supporting telecommunication networks.',
    },
    {
      code: 'BUILDINGS_CONTAINERS',
      name: 'Buildings & Containers',
      description: 'Buildings and physical structures containing telecommunication equipment.',
    },
    {
      code: 'FIBER_INFRASTRUCTURE',
      name: 'Fiber Infrastructure',
      description: 'Fiber cables and supporting cable infrastructure.',
    },
    {
      code: 'FIBER_DISTRIBUTION',
      name: 'Fiber Distribution',
      description: 'Equipment and facilities used for fiber distribution and cross-connection.',
    },
    {
      code: 'ACTIVE_EQUIPMENT',
      name: 'Active Network Equipment',
      description: 'Active equipment used to transmit, route, and process network signals.',
    },
    {
      code: 'OPTICAL_COMPONENTS',
      name: 'Optical Components',
      description: 'Optical components used in fiber optic networks.',
    },
  ];

  for (const item of categories) {
    let category = await repository.findOne({
      where: { code: item.code },
    });

    if (category) {
      repository.merge(category, item);
    } else {
      category = repository.create(item);
    }

    await repository.save(category);
  }

  console.log('Asset categories seeded.');
}
