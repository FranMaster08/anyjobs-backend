import type { AuthUser } from '../../domain';

export interface UserRepositoryPort {
  create(user: Omit<AuthUser, 'id' | 'createdAt'> & Partial<Pick<AuthUser, 'createdAt'>>): Promise<AuthUser>;
  findById(id: string): Promise<AuthUser | null>;
  findByEmail(email: string): Promise<AuthUser | null>;
  findByPhoneNumber(phoneNumber: string): Promise<AuthUser | null>;
  update(id: string, patch: Partial<AuthUser>): Promise<AuthUser>;
}

