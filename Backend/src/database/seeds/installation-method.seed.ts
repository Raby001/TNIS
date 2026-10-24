import { InstallationMethod } from 'src/modules/cables/entities/installation-method.entity';
import { DataSource } from 'typeorm';

export async function seedInstallationMethods(dataSource: DataSource,): Promise<void> {
  
  const installationMethodRepository = dataSource.getRepository(InstallationMethod);

  const installationMethods = [
    {
      name: 'Aerial (Overhead)',
      lineStyle: 'Aerial',
      description: 'Fiber cable installed above ground using aerial infrastructure.',
    },
    {
      name: 'Direct Buried',
      lineStyle: 'Direct-Buried',
      description: 'Fiber cable installed directly underground without a conduit.',
    },
    {
      name: 'Conduit',
      lineStyle: 'Conduit',
      description: 'Fiber cable installed inside a protective conduit or pipe.',
    },
  ];

  for (const installationMethod of installationMethods) {
    const existing = await installationMethodRepository.findOne({
      where: {
        name: installationMethod.name,
      },
    });

    if (existing) {
      continue;
    }

    await installationMethodRepository.save(installationMethod);
  }

  console.log('Installation Method seeded successfully.');
}