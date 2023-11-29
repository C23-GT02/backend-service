import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No specific roles are required for this route.
    }

    const request = context.switchToHttp().getRequest();
    const idCookie = request.signedCookies.id;
    const userRoles = idCookie.role;

    if (!idCookie || userRoles) {
      return false; // User role information is not available in the cookie.
    }

    // Check if the user has any of the required roles.
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
