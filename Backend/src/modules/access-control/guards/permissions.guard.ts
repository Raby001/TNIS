import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from 'src/modules/users/entities/user.entity';
import { AuthorizationService } from '../authorization.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

    // Endpoint does not require a specific permission.
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPermissions = await this.authorizationService.hasPermissions(
        user.roleId,
        requiredPermissions,
      );

    if (!hasPermissions) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}