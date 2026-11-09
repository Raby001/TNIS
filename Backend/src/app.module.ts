import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { AssetsModule } from './modules/assets/assets.module';
import { LocationsModule } from './modules/locations/locations.module';
import { SitesModule } from './modules/sites/sites.module';
import { HeirarchyModule } from './modules/hierarchy/heirarchy.module';
import { SpliceClosuresModule } from './modules/splice-closures/splice-closures.module';
import { CablesModule } from './modules/cables/cables.module';
import { MapModule } from './modules/map/map.module';
import { ReferenceDataModule } from './modules/reference-data/reference-data.module';
import { FiberSpliceModule } from './modules/fiber-splices/fiber-splices.module';
import { FiberCableConnectionModule } from './modules/fiber-cable-connections/fiber-cable-connection.module';
import { TowersModule } from './modules/towers/towers.module';
import { NapsModule } from './modules/naps/naps.module';
import { BuildingsModule } from './modules/buildings/buildings.module';
import { RacksModule } from './modules/racks/racks.module';
import { RoutersModule } from './modules/routers/router.module';
import { UsersModule } from './modules/users/users.module';
import { AccessControlModule } from './modules/access-control/access-control.module';
import { RolesModule } from './modules/roles/roles.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OnusModule } from './modules/onus/onus.module';
import { ManholesModule } from './modules/manholes/manholes.module';
import { HandholesModule } from './modules/handholes/handholes.module';
import { PolesModule } from './modules/poles/poles.module';
import { OccsModule } from './modules/occs/occs.module';
import { OpticalSplittersModule } from './modules/optical-splitters/optical-splitters.module';
import { FiberCoreSplitterConnectionsModule } from './modules/fiber-core-splitter-connections/fiber-core-splitter-connections.module';
import { LcpsModule } from './modules/lcps/lcps.module';
import { FieldObservationsModule } from './modules/field-observations/field-observations.module';
import { FiberCoreOnuConnectionsModule } from './modules/fiber-core-onu-connections/fiber-core-onu-connections.module';
import { FiberCoreOccPortConnectionModule } from './modules/fiber-core-occ-port-connection/fiber-core-occ-port-connection.module';
import { FiberCoreSpliceClosurePortConnectionsModule } from './modules/fiber-core-splice-closure-port-connection/fiber-core-splice-closure-port-connection.module';
import { FiberCoreRouterPortConnectionModule } from './modules/fiber-core-router-port-connections/fiber-core-router-port-connection.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
      ],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => (
        {
          type: 'postgres',
          host: config.get<string>('database.host'),
          port: Number(config.get('database.port')),
          
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.database'),

          autoLoadEntities: true,
          synchronize: true,

          // logging: ['query', 'error'],
        }
      )
    }),

    UsersModule,
    AuthModule,
    AccessControlModule,
    RolesModule,

    AssetsModule,

    SitesModule, 
    HeirarchyModule,    

    MapModule, 

    CablesModule,

    FiberCableConnectionModule,
    
    OpticalSplittersModule,
    FiberCoreSplitterConnectionsModule,

    SpliceClosuresModule,
    FiberSpliceModule,
    FiberCoreSpliceClosurePortConnectionsModule,

    LcpsModule,

    NapsModule,

    CustomersModule,
    OnusModule,
    FiberCoreOnuConnectionsModule,

    OccsModule,
    FiberCoreOccPortConnectionModule,    

    TowersModule,
    LocationsModule,
    ManholesModule,
    HandholesModule,
    PolesModule,

    BuildingsModule,
    RacksModule,

    RoutersModule,
    FiberCoreRouterPortConnectionModule,

    FieldObservationsModule,
    ReferenceDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
