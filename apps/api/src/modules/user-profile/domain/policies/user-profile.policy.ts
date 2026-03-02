import type { UserProfileFieldErrors } from '../interfaces/user-profile-field-errors.interface';
import type { UserProfileUser } from '../interfaces/user-profile-user.interface';
import type { DocumentType } from '../types/document-type.type';
import type { Gender } from '../types/gender.type';
import type { PreferredPaymentMethod } from '../types/preferred-payment-method.type';
import type { UserRole } from '../types/user-role.type';

export class UserProfilePolicy {
  static validateWorkerProfileUpdate(actorRoles: UserRole[], categories: string[]): UserProfileFieldErrors | null {
    const isWorker = actorRoles.includes('WORKER');
    if (!isWorker) return null;

    if (!categories || categories.length < 1) {
      return { fieldErrors: { categories: 'At least one category is required for WORKER.' } };
    }
    return null;
  }

  static validatePersonalInfoRequiredForWorker(
    actorRoles: UserRole[],
    input: { documentType?: DocumentType; documentNumber?: string; birthDate?: string },
  ): UserProfileFieldErrors | null {
    const isWorker = actorRoles.includes('WORKER');
    if (!isWorker) return null;

    if (!input.documentType || !input.documentNumber || !input.birthDate) {
      return { fieldErrors: { personalInfo: 'documentType, documentNumber and birthDate are required for WORKER.' } };
    }
    return null;
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
      nationality: input.nationality?.trim(),
    };
  }

  static buildPatchForLocation(input: {
    city: string;
    area?: string;
    countryCode?: string;
    coverageRadiusKm?: number;
  }): Pick<UserProfileUser, 'city' | 'area' | 'countryCode' | 'coverageRadiusKm'> {
    return {
      city: input.city.trim(),
      area: input.area?.trim(),
      countryCode: input.countryCode?.trim(),
      coverageRadiusKm: input.coverageRadiusKm,
    };
  }

  static buildPatchForClientProfile(input: {
    preferredPaymentMethod: PreferredPaymentMethod;
  }): Pick<UserProfileUser, 'preferredPaymentMethod'> {
    return { preferredPaymentMethod: input.preferredPaymentMethod };
  }
}

