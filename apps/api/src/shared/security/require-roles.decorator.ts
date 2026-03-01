import { SetMetadata } from '@nestjs/common';
import { REQUIRED_ROLES_KEY } from './rbac.constants';

export function RequireRoles(...roles: string[]) {
  return SetMetadata(REQUIRED_ROLES_KEY, roles);
}

