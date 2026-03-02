import type { DocumentType } from '../types/document-type.type';
import type { Gender } from '../types/gender.type';
import type { PreferredPaymentMethod } from '../types/preferred-payment-method.type';
import type { UserRole } from '../types/user-role.type';

export interface UserProfileUser {
  id: string;
  roles: UserRole[];

  countryCode?: string;
  city?: string;
  area?: string;
  coverageRadiusKm?: number;

  workerCategories?: string[];
  workerHeadline?: string;
  workerBio?: string;

  preferredPaymentMethod?: PreferredPaymentMethod;

  documentType?: DocumentType;
  documentNumber?: string;
  birthDate?: string;
  gender?: Gender;
  nationality?: string;
}

