import { Injectable } from '@nestjs/common';
import { InMemoryUsersStore } from '../../../../shared/in-memory/users.store';
import type { AuthUser } from '../../domain';
import type { UserRepositoryPort } from '../../application/ports/user-repository.port';

@Injectable()
export class InMemoryAuthUserRepository implements UserRepositoryPort {
  constructor(private readonly usersStore: InMemoryUsersStore) {}

  async create(
    user: Omit<AuthUser, 'id' | 'createdAt'> & Partial<Pick<AuthUser, 'createdAt'>>,
  ): Promise<AuthUser> {
    return this.usersStore.create(user);
  }

  async findById(id: string): Promise<AuthUser | null> {
    return this.usersStore.findById(id) ?? null;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.usersStore.findByEmail(email) ?? null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<AuthUser | null> {
    return this.usersStore.findByPhoneNumber(phoneNumber) ?? null;
  }

  async update(id: string, patch: Partial<AuthUser>): Promise<AuthUser> {
    return this.usersStore.update(id, patch);
  }
}

