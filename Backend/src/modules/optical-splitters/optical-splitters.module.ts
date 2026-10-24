import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpticalSplittersService } from './optical-splitters.service';
import { SplitterRatio } from './entities/splitter-ratio.entity';
import { OpticalSplitter } from './entities/optical-splitter.entity';
import { OpticalSplitterPort } from './entities/optical-splitter-port.entity';
import { OpticalSplittersController } from './optical-splitters.controller';
import { AccessControlModule } from '../access-control/access-control.module';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SplitterRatio,
      OpticalSplitter,
      OpticalSplitterPort,
    ]),
    AccessControlModule,
    AssetsModule,
  ],

  controllers: [
    OpticalSplittersController,
  ],

  providers: [
    OpticalSplittersService,
  ],

  exports: [
    OpticalSplittersService,
  ],
})
export class OpticalSplittersModule {}