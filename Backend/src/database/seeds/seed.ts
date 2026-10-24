import 'dotenv/config';
import databaseConfig from 'src/config/database.config';
import { DataSource } from 'typeorm';
import { seedAssetTypes } from './asset-type.seed';
import { seedStatuses } from './status.seed';
import { seedProvinces } from './province.seed';
import { seedCities } from './city.seed';
import { seedCableCoreCount } from './cable-core-count.seed';
import { seedCableTypes } from './cable-type.seed';
import { seedInstallationMethods } from './installation-method.seed';
import { seedFiberCoreStatuses } from './fiber-core-status.seed';
import { seedFiberSpliceStatuses } from './fiberSplice-status.seed';
import { seedSites } from './site.seed';
import { seedFiberSegmentTypes } from './fiber-segment-type.seed';
import { seedPermissions } from './permission.seed';
import { seedRoles } from './role.seed';
import { seedUsers } from './user.seed';
import { seedSplitterRatios } from './splitter-ratios.seed';
import { seedFiberCoreSplitterConnectionStatuses } from './fiber-core-splitter-connection-statuses.seed';
import { seedFiberCoreOnuConnectionStatuses } from './fiber-core-onu-connection-statuses';
import { seedFiberCoreOccPortConnectionStatuses } from './fiber-core-occ-port-connection-statuses.seed';
import { seedFiberCoreSpliceClosurePortConnectionStatuses } from './fiber-core-splice-closure-port-connection-statuses.seed';
import { seedFiberCoreRouterPortConnectionStatuses } from './fiber-core-router-port-connection-status';

const dataSource = new DataSource({
  type: 'postgres',

  ...databaseConfig(),

  entities: [
    'src/modules/**/*.entity.ts',
  ],
});

async function runSeed() {
  try {
    await dataSource.initialize();

    console.log('Seeding !! Database Connected');

    await seedPermissions(dataSource);
    await seedRoles(dataSource);

    await seedAssetTypes(dataSource);
    await seedStatuses(dataSource);

    await seedProvinces(dataSource);
    await seedCities(dataSource);

    await seedUsers(dataSource);

    await seedSplitterRatios(dataSource);
    await seedFiberCoreSplitterConnectionStatuses(dataSource);

    await seedCableCoreCount(dataSource);
    await seedCableTypes(dataSource);
    await seedInstallationMethods(dataSource);
    await seedFiberSegmentTypes(dataSource);

    await seedFiberCoreStatuses(dataSource);
    await seedFiberSpliceStatuses(dataSource);

    await seedSites(dataSource);

    await seedFiberCoreOnuConnectionStatuses(dataSource);

    await seedFiberCoreOccPortConnectionStatuses(dataSource);
    
    await seedFiberCoreSpliceClosurePortConnectionStatuses(dataSource);

    await seedFiberCoreRouterPortConnectionStatuses(dataSource);

    console.log('All seed completed.');
  } catch (error) {
    console.error('Seed fail: ', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runSeed();