import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpliceClosure } from './entities/splice-closure.entity';
import { SpliceClosuresController } from './splice-closures.controller';
import { SpliceClosuresService } from './splice-closures.service';
import { AssetsModule } from '../assets/assets.module';
import { FiberSpliceModule } from '../fiber-splices/fiber-splices.module';
import { AccessControlModule } from '../access-control/access-control.module';
import { SpliceClosurePort } from './entities/splice-closure-port.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpliceClosure,
      SpliceClosurePort,
    ]),
    AssetsModule,
    FiberSpliceModule,
    AccessControlModule,
  ],

  controllers: [
    SpliceClosuresController,
  ],

  providers: [
    SpliceClosuresService,
  ],

  exports: [
    SpliceClosuresService,
    TypeOrmModule,
  ],
})
export class SpliceClosuresModule {}