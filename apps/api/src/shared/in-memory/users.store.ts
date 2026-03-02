import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export type StoredUserRole = 'CLIENT' | 'WORKER';
export type StoredRegistrationStatus = 'PENDING' | 'ACTIVE';

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  roles: StoredUserRole[];
  status: StoredRegistrationStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string; // ISO-8601

  // Campos opcionales que algunos endpoints pueden setear luego
  countryCode?: string;
  city?: string;
  area?: string;
  coverageRadiusKm?: number;
  workerCategories?: string[];
  workerHeadline?: string;
  workerBio?: string;
  preferredPaymentMethod?: 'CARD' | 'TRANSFER' | 'CASH' | 'WALLET';
  documentType?: 'DNI' | 'NIE' | 'PASSPORT';
  documentNumber?: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  nationality?: string;
}

@Injectable()
export class InMemoryUsersStore {
  private readonly usersById = new Map<string, StoredUser>();

  create(input: Omit<StoredUser, 'id' | 'createdAt'> & Partial<Pick<StoredUser, 'id' | 'createdAt'>>): StoredUser {
    const id = input.id ?? randomUUID();
    const createdAt = input.createdAt ?? new Date().toISOString();

    const user: StoredUser = {
      id,
      createdAt,
      ...input,
    };

    this.usersById.set(user.id, user);
    return user;
  }

  findById(id: string): StoredUser | undefined {
    return this.usersById.get(id);
  }

  findByEmail(email: string): StoredUser | undefined {
    const normalized = email.trim().toLowerCase();
    for (const u of this.usersById.values()) {
      if (u.email.trim().toLowerCase() === normalized) return u;
    }
    return undefined;
  }

  findByPhoneNumber(phoneNumber: string): StoredUser | undefined {
    const normalized = phoneNumber.trim();
    for (const u of this.usersById.values()) {
      if (u.phoneNumber.trim() === normalized) return u;
    }
    return undefined;
  }

  update(id: string, patch: Partial<StoredUser>): StoredUser {
    const existing = this.usersById.get(id);
    if (!existing) throw new Error(`User not found: ${id}`);
    const updated: StoredUser = { ...existing, ...patch };
    this.usersById.set(id, updated);
    return updated;
  }
}

