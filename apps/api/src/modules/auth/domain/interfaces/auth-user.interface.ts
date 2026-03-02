import type { RegistrationStatus } from '../types/registration-status.type';
import type { UserRole } from '../types/user-role.type';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  roles: UserRole[];
  status: RegistrationStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string; // ISO-8601

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
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  nationality?: string;
}

