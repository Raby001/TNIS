import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { User } from '../users/entities/user.entity';

@Injectable()
export class AuditAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<{ user?: User }>();
    return user?.role?.name === 'ADMIN';
  }
}
