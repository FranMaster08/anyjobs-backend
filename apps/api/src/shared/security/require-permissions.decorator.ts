import { SetMetadata } from '@nestjs/common';
import { REQUIRED_PERMISSIONS_KEY } from './rbac.constants';

export function RequirePermissions(...permissions: string[]) {
  return SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
}

