import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldObservation } from './entities/field-observation.entity';
import { FieldObservationsController } from './field-observations.controller';
import { FieldObservationsService } from './field-observations.service';
import { Asset } from '../assets/entities/asset.entity';
import { AccessControlModule } from '../access-control/access-control.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TowersModule } from '../towers/towers.module';
import { PolesModule } from '../poles/poles.module';
import { ManholesModule } from '../manholes/manholes.module';
import { HandholesModule } from '../handholes/handholes.module';
import { NapsModule } from '../naps/naps.module';
import { OnusModule } from '../onus/onus.module';
import { LcpsModule } from '../lcps/lcps.module';
import { OccsModule } from '../occs/occs.module';
import { RacksModule } from '../racks/racks.module';
import { RoutersModule } from '../routers/router.module';
import { SpliceClosuresModule } from '../splice-closures/splice-closures.module';
import { FieldObservationConversionService } from './providers/field-observation-conversion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldObservation,
      Asset,
    ]),

    AuthModule,
    UsersModule,
    AccessControlModule,

    TowersModule,
    PolesModule,
    ManholesModule,
    HandholesModule,
    NapsModule,
    OnusModule,
    LcpsModule,
    OccsModule,
    RacksModule,
    RoutersModule,
    SpliceClosuresModule,
   
  ],

  controllers: [
    FieldObservationsController,
  ],

  providers: [
    FieldObservationsService,
    FieldObservationConversionService,
  ],

  exports: [
    FieldObservationsService,
  ],
})
export class FieldObservationsModule {}