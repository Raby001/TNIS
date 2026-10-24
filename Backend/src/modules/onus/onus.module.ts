import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsModule } from 'src/modules/assets/assets.module';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Onu } from './entities/onu.entity';
import { OnusController } from './onus.controller';
import { OnusService } from './onus.service';
import { AccessControlModule } from '../access-control/access-control.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Onu,
      Asset,
      Customer,
    ]),
    AccessControlModule,
    AssetsModule,
    CustomersModule,
  ],

  controllers: [
    OnusController,
  ],

  providers: [
    OnusService,
  ],

  exports: [
    OnusService,
  ],
})
export class OnusModule {}