import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { hasMinRole, type UserRole } from '@ems/shared';
import type { IJwtPayload } from '@ems/shared';
import type { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest<Request & { user: IJwtPayload }>();
    const userRole = req.user?.role;

    const hasRole = requiredRoles.some((required) =>
      hasMinRole(userRole as UserRole, required),
    );

    if (!hasRole) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: `Requires one of: ${requiredRoles.join(', ')}`,
      });
    }

    return true;
  }
}
