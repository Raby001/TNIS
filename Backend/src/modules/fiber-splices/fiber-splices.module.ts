import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from '../access-control/access-control.module';
import { SpliceClosurePort } from '../splice-closures/entities/splice-closure-port.entity';
import { FiberSplice } from './entities/fiber-splice.entity';
import { FiberSpliceStatus } from './entities/fiber-splice-status.entity';
import { FiberSplicesController } from './fiber-splices.controller';
import { FiberSplicesService } from './fiber-splices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiberSplice,
      FiberSpliceStatus,
      SpliceClosurePort,
    ]),

    AccessControlModule,
  ],

  controllers: [
    FiberSplicesController,
  ],

  providers: [
    FiberSplicesService,
  ],

  exports: [
    FiberSplicesService,
  ],
})
export class FiberSpliceModule {}