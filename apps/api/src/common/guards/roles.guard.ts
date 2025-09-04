import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organization = request.organization;

    if (!user || !organization) {
      throw new ForbiddenException('用户或组织信息缺失');
    }

    // 查找用户在当前组织中的角色
    const membership = user.memberships.find(
      (m: any) => m.organizationId === organization.id
    );

    if (!membership) {
      throw new ForbiddenException('用户不属于当前组织');
    }

    const hasRole = requiredRoles.includes(membership.role);
    
    if (!hasRole) {
      throw new ForbiddenException('权限不足');
    }

    return true;
  }
}