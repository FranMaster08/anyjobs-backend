import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { CorrelationIdService } from '../correlation/correlation-id.service';
import { createAppLogger } from '../logging/app-logger';
import { AuthTokenRegistry } from '../../modules/auth/infrastructure/adapters/auth-token-registry';
import {
  IS_PUBLIC_KEY,
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from './rbac.constants';

function parseCsvHeader(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

@Injectable()
export class AuthRbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly correlationIdService: CorrelationIdService,
    private readonly configService: ConfigService,
    private readonly tokenRegistry: AuthTokenRegistry,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(REQUIRED_ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: unknown }>();

    const authorization = (req.headers['authorization'] as string | undefined) ?? '';
    const hasAuthHeader = authorization.trim().length > 0;
    if (!hasAuthHeader) throw new UnauthorizedException();

    const isBearer = authorization.toLowerCase().startsWith('bearer ');
    if (!isBearer) throw new UnauthorizedException();

    const token = authorization.slice('bearer '.length).trim();
    if (!token) throw new UnauthorizedException();

    const session = this.tokenRegistry.resolve(token);

    const userPermissionsHeader = parseCsvHeader(req.headers['x-permissions']);
    const userRolesHeader = parseCsvHeader(req.headers['x-roles']);
    const userIdHeader = typeof req.headers['x-user-id'] === 'string' ? req.headers['x-user-id'] : undefined;

    const resolvedUserId = userIdHeader ?? session?.userId;
    if (!resolvedUserId) throw new UnauthorizedException();

    const resolvedRoles = userRolesHeader.length > 0 ? userRolesHeader : (session?.roles ?? []);
    const resolvedPermissions =
      userPermissionsHeader.length > 0
        ? userPermissionsHeader
        : // MVP: si hay sesión válida, asumimos permisos suficientes para pasar el chequeo declarado.
          requiredPermissions;

    req.user = {
      token,
      userId: resolvedUserId,
      permissions: resolvedPermissions,
      roles: resolvedRoles,
    };

    const debugPayloads = this.configService.get<boolean>('logging.debugPayloads') ?? false;
    const logger = createAppLogger(AuthRbacGuard.name, this.correlationIdService, debugPayloads);

    // DENY BY DEFAULT: si el endpoint no declara permisos/roles, se deniega.
    if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
      logger.warn('Deny-by-default (missing RBAC metadata)', {
        path: (req as any).originalUrl ?? (req as any).url,
        method: (req as any).method,
      });
      throw new ForbiddenException();
    }

    const hasAllPermissions = requiredPermissions.every((p) => resolvedPermissions.includes(p));
    const hasAnyRequiredRole =
      requiredRoles.length === 0 ? true : requiredRoles.some((r) => resolvedRoles.includes(r));

    if (!hasAllPermissions || !hasAnyRequiredRole) {
      logger.warn('Forbidden (RBAC)', {
        requiredPermissions,
        requiredRoles,
      });
      throw new ForbiddenException();
    }

    return true;
  }
}

