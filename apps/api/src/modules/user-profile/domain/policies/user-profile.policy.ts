import type { UserProfileFieldErrors } from '../interfaces/user-profile-field-errors.interface';
import type { UserProfileUser } from '../interfaces/user-profile-user.interface';
import type { DocumentType } from '../types/document-type.type';
import type { Gender } from '../types/gender.type';
import type { PreferredPaymentMethod } from '../types/preferred-payment-method.type';
import type { UserRole } from '../types/user-role.type';
import { validateSupportedLocation } from '../../../../shared/location/supported-location.catalog';
import { isIsoCountryCode } from '../../../../shared/location/world-countries.data';
import { isAdultBirthDate } from '../../../../shared/validation/birth-date';

export class UserProfilePolicy {
  static validateWorkerProfileUpdate(actorRoles: UserRole[], categories: string[]): UserProfileFieldErrors | null {
    const isWorker = actorRoles.includes('WORKER');
    if (!isWorker) return null;

    if (!categories || categories.length < 1) {
      return { fieldErrors: { categories: 'At least one category is required for WORKER.' } };
    }
    return null;
  }

  static validateLocation(input: {
    city?: string;
    municipality?: string;
    area?: string;
    countryCode?: string;
  }): UserProfileFieldErrors | null {
    const fieldErrors = validateSupportedLocation(input);
    return fieldErrors ? { fieldErrors } : null;
  }

  static validatePersonalInfoRequiredForWorker(
    actorRoles: UserRole[],
    input: {
      documentType?: DocumentType;
      documentNumber?: string;
      birthDate?: string;
      gender?: Gender;
      nationality?: string;
    },
  ): UserProfileFieldErrors | null {
    const isWorker = actorRoles.includes('WORKER');
    if (!isWorker) return null;

    const fieldErrors: Record<string, string> = {};

    if (!input.documentType) {
      fieldErrors.documentType = 'Document type is required for WORKER.';
    }
    if (!input.documentNumber?.trim()) {
      fieldErrors.documentNumber = 'Document number is required for WORKER.';
    }
    if (!input.birthDate?.trim()) {
      fieldErrors.birthDate = 'Birth date is required for WORKER.';
    } else if (!isAdultBirthDate(input.birthDate)) {
      fieldErrors.birthDate = 'You must be at least 18 years old.';
    }
    if (!input.gender) {
      fieldErrors.gender = 'Gender is required for WORKER.';
    }
    const nationality = input.nationality?.trim().toUpperCase();
    if (!nationality) {
      fieldErrors.nationality = 'Nationality is required for WORKER.';
    } else if (!isIsoCountryCode(nationality)) {
      fieldErrors.nationality = 'Nationality must be a valid ISO country code (e.g. CO, ES, AR).';
    }

    return Object.keys(fieldErrors).length > 0 ? { fieldErrors } : null;
  }

  static buildPatchForWorkerProfile(input: {
    categories: string[];
    headline?: string;
    bio?: string;
  }): Pick<UserProfileUser, 'workerCategories' | 'workerHeadline' | 'workerBio'> {
    return {
      workerCategories: input.categories,
      workerHeadline: input.headline?.trim(),
      workerBio: input.bio?.trim(),
    };
  }

  static buildPatchForPersonalInfo(input: {
    documentType: DocumentType;
    documentNumber: string;
    birthDate: string;
    gender?: Gender;
    nationality?: string;
  }): Pick<UserProfileUser, 'documentType' | 'documentNumber' | 'birthDate' | 'gender' | 'nationality'> {
    return {
      documentType: input.documentType,
      documentNumber: input.documentNumber.trim(),
      birthDate: input.birthDate,
      gender: input.gender,
      nationality: input.nationality?.trim().toUpperCase(),
    };
  }

  static buildPatchForLocation(input: {
    city: string;
    municipality?: string;
    area?: string;
    countryCode?: string;
    coverageRadiusKm?: number;
  }): Pick<UserProfileUser, 'city' | 'municipality' | 'area' | 'countryCode' | 'coverageRadiusKm'> {
    return {
      city: input.city.trim(),
      municipality: input.municipality?.trim(),
      area: input.area?.trim(),
      countryCode: input.countryCode?.trim().toUpperCase(),
      coverageRadiusKm: input.coverageRadiusKm,
    };
  }

  static buildPatchForClientProfile(input: {
    preferredPaymentMethod: PreferredPaymentMethod;
  }): Pick<UserProfileUser, 'preferredPaymentMethod'> {
    return { preferredPaymentMethod: input.preferredPaymentMethod };
  }
}
