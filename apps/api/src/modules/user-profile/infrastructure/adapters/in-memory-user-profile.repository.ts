import { Injectable } from '@nestjs/common';
import { InMemoryUsersStore } from '../../../../shared/in-memory/users.store';
import type { UserProfileUser } from '../../domain';
import type { UserProfileRepositoryPort } from '../../application/ports/user-profile-repository.port';

@Injectable()
export class InMemoryUserProfileRepository implements UserProfileRepositoryPort {
  constructor(private readonly usersStore: InMemoryUsersStore) {}

  async findById(id: string): Promise<UserProfileUser | null> {
    const u = this.usersStore.findById(id);
    if (!u) return null;
    const { passwordHash: _passwordHash, email: _email, phoneNumber: _phoneNumber, fullName: _fullName, status: _status, emailVerified: _ev, phoneVerified: _pv, createdAt: _ca, ...rest } =
      u as any;
    return rest as UserProfileUser;
  }

  async update(id: string, patch: Partial<UserProfileUser>): Promise<void> {
    this.usersStore.update(id, patch as any);
  }
}

