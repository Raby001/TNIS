import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapService } from './map.service';
import { MapController } from './map.controller';
import { MAP_FEATURE_PROVIDERS } from './constants/map.constants';
import { MapFeatureProvider } from './interfaces/map-feature-provider.interface';
import { Site } from '../sites/entities/site.entity';
import { FiberCable } from '../cables/entities/fiber-cable.entity';
import { SpliceClosure } from '../splice-closures/entities/splice-closure.entity';
import { Tower } from '../towers/entities/tower.entity';
import { Nap } from '../naps/entities/nap.entity';
import { Onu } from '../onus/entities/onu.entity';
import { Manhole } from '../manholes/entities/manhole.entity';
import { Handhole } from '../handholes/entities/handhole.entity';
import { Pole } from '../poles/entities/pole.entity';
import { SiteMapFeatureProvider } from './providers/site-map-feature.provider';
import { FiberCableMapFeatureProvider } from './providers/fiber-cable-map-feature.provider';
import { SpliceClosureMapFeatureProvider } from './providers/splice-closure-map-feature.provider';
import { TowerMapFeatureProvider } from './providers/tower-map-feature.provider';
import { NapMapFeatureProvider } from './providers/nap-map-feature.provider';
import { ManholeMapFeatureProvider } from './providers/manhole-map-feature.provider';
import { HandholeMapFeatureProvider } from './providers/handhole-map-feature.provider';
import { PoleMapFeatureProvider } from './providers/pole-map-feature.provider';
import { AccessControlModule } from '../access-control/access-control.module';
import { OnuMapFeatureProvider } from './providers/onu-map-feature.provider';
import { Occ } from '../occs/entities/occ.entity';
import { OccMapFeatureProvider } from './providers/occ-map-feature.provider';
import { FieldObservationMapFeatureProvider } from './providers/field-observation-map-feature.provider';
import { LcpMapFeatureProvider } from './providers/lcp-map-feature.provider';
import { FieldObservation } from '../field-observations/entities/field-observation.entity';
import { Lcp } from '../lcps/entities/lcp.entity';
import { MapSymbolsModule } from '../map-symbols/map-symbols.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Site,
      FiberCable,
      SpliceClosure,
      Tower,
      Nap,
      Onu,
      Manhole,
      Handhole,
      Pole,
      Occ,
      FieldObservation,
      Lcp,
    ]),

    AccessControlModule,
    MapSymbolsModule,
  ],

  controllers: [
    MapController,
  ],

  providers: [

    SiteMapFeatureProvider,
    FiberCableMapFeatureProvider,
    SpliceClosureMapFeatureProvider,
    TowerMapFeatureProvider,
    NapMapFeatureProvider,
    OnuMapFeatureProvider,
    ManholeMapFeatureProvider,
    HandholeMapFeatureProvider,
    PoleMapFeatureProvider,
    OccMapFeatureProvider,
    FieldObservationMapFeatureProvider,
    LcpMapFeatureProvider,

    {
      provide: MAP_FEATURE_PROVIDERS,

      useFactory: (
        siteProvider: SiteMapFeatureProvider,
        fiberCableProvider: FiberCableMapFeatureProvider,
        spliceClosureProvider: SpliceClosureMapFeatureProvider,
        towerProvider: TowerMapFeatureProvider,
        napProvider: NapMapFeatureProvider,
        onuProvider: OnuMapFeatureProvider,
        manholeProvider: ManholeMapFeatureProvider,
        handholeProvider: HandholeMapFeatureProvider,
        poleProvider: PoleMapFeatureProvider,
        occProvider: OccMapFeatureProvider,
        FieldObservationProvider: FieldObservationMapFeatureProvider,
        LcpMapProvider: LcpMapFeatureProvider,
      ): MapFeatureProvider[] => {
        return [
          siteProvider,
          fiberCableProvider,
          spliceClosureProvider,
          towerProvider,
          napProvider,
          onuProvider,
          manholeProvider,
          handholeProvider,
          poleProvider,
          occProvider,
          FieldObservationProvider,
          LcpMapProvider,
        ];
      },

      inject: [
        SiteMapFeatureProvider,
        FiberCableMapFeatureProvider,
        SpliceClosureMapFeatureProvider,
        TowerMapFeatureProvider,
        NapMapFeatureProvider,
        OnuMapFeatureProvider,
        ManholeMapFeatureProvider,
        HandholeMapFeatureProvider,
        PoleMapFeatureProvider,
        OccMapFeatureProvider,
        FieldObservationMapFeatureProvider,
        LcpMapFeatureProvider,
      ],
    },

    MapService,
  ],
})
export class MapModule {}