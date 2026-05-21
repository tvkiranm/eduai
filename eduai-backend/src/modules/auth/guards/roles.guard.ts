import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  // `Reflector` NestJS utility hai jo decorators (metadata) se values read karta hai.
  public constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    // Controller/route par jo `@Roles(...)` laga hai, uske roles yahan milte hain.
    // `getAllAndOverride` handler + class dono se metadata check karta hai (handler wins).
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Agar route par koi role required hi nahi hai, to allow kar do.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // HTTP request object nikaal rahe hain (Express/Fastify request).
    // JwtAuthGuard (passport) successful hone ke baad `request.user` set karta hai.
    const request = context.switchToHttp().getRequest<{ user?: unknown }>();

    // `request.user` ko read kar rahe hain (type unknown rakha taaki unsafe `any` na ho).
    const user = request.user;

    // Agar user hi missing hai to role check possible nahi -> block.
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // User object se role safely extract karo.
    const role = (user as { role?: UserRole }).role;

    // Agar role missing hai to bhi block.
    if (!role) {
      throw new ForbiddenException('User role not found');
    }

    // Check: user ka role required roles me hai kya?
    const hasRole = requiredRoles.includes(role);

    // Role match nahi hua to permission deny.
    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    // Sab ok -> allow request.
    return true;
  }
}
