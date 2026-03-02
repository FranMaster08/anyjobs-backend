import type { UserProfileUser } from '../../domain';
import type { UserRole } from '../../domain';

export interface UserProfileRepositoryPort {
  findById(id: string): Promise<UserProfileUser | null>;
  update(id: string, patch: Partial<UserProfileUser>): Promise<void>;
}

