import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AccessControlModule } from '../access-control/access-control.module';
import { CustomerCodeService } from './providers/customer-code.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
    ]),
    AccessControlModule,
  ],

  controllers: [
    CustomersController,
  ],

  providers: [
    CustomersService,
    CustomerCodeService,
  ],

  exports: [
    CustomersService,
    CustomerCodeService,
  ],
})
export class CustomersModule {}