import type { AuthUser } from '../interfaces/auth-user.interface';

export type NewAuthUser = Omit<AuthUser, 'id' | 'createdAt'>;

