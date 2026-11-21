import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { AuditAdminGuard } from './audit-admin.guard';
import { AuditActorInterceptor } from './audit-actor';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditLogsController],
  providers: [
    AuditLogsService, AuditAdminGuard,
    { provide: APP_INTERCEPTOR, useClass: AuditActorInterceptor },
  ],
})
export class AuditLogsModule implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    // The audit table and triggers are installed in one migration transaction.
    // Fail before accepting inventory requests if deployment skipped that step.
    await this.dataSource.query('SELECT id FROM public.audit_logs LIMIT 0');
  }
}
