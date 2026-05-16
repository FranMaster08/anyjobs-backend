import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { AppException } from '../../../../shared/errors/app-exception';
import { createAppLogger } from '../../../../shared/logging/app-logger';
import { UserEntity } from '../../../../shared/persistence/entities';
import { AUTH_PASSWORD_HASHER, AUTH_USER_REPOSITORY } from '../ports';
import type { PasswordHasherPort, UserRepositoryPort } from '../ports';
import type { UserRole } from '../../domain';
import { Email, PhoneNumber } from '../../domain';
import { validateSupportedLocation } from '../../../../shared/location/supported-location.catalog';
import { isIsoCountryCode } from '../../../../shared/location/world-countries.data';
import { isAdultBirthDate } from '../../../../shared/validation/birth-date';

export interface CompleteOnboardingAccountInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: UserRole[];
}

export interface CompleteOnboardingLocationInput {
  city: string;
  municipality: string;
  area: string;
  countryCode: string;
  coverageRadiusKm?: number;
}

export interface CompleteOnboardingWorkerProfileInput {
  categories: string[];
  headline?: string;
  bio?: string;
}

export interface CompleteOnboardingPersonalInfoInput {
  documentType: string;
  documentNumber: string;
  birthDate: string;
  gender: string;
  nationality: string;
}

export interface CompleteOnboardingRegistrationInput {
  account: CompleteOnboardingAccountInput;
  emailVerified: boolean;
  phoneVerified: boolean;
  location: CompleteOnboardingLocationInput;
  workerProfile?: CompleteOnboardingWorkerProfileInput;
  preferredPaymentMethod?: 'CARD' | 'TRANSFER' | 'CASH' | 'WALLET';
  personalInfo?: CompleteOnboardingPersonalInfoInput;
}

@Injectable()
export class CompleteOnboardingRegistrationUseCase {
  private readonly logger;

  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
    @Inject(AUTH_PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort,
    @InjectDataSource() private readonly dataSource: DataSource,
    correlationIdService: CorrelationIdService,
    configService: ConfigService,
  ) {
    const debugPayloads = configService.get<boolean>('logging.debugPayloads') ?? false;
    this.logger = createAppLogger(CompleteOnboardingRegistrationUseCase.name, correlationIdService, debugPayloads);
  }

  async execute(input: CompleteOnboardingRegistrationInput): Promise<{ userId: string }> {
    const email = Email.create(input.account.email).value;
    const phoneNumber = PhoneNumber.create(input.account.phoneNumber).value;
    const roles = input.account.roles;

    this.assertReady(input, roles);

    const existingEmail = await this.userRepo.findByEmail(email);
    if (existingEmail) {
      throw new AppException('USER.EMAIL_ALREADY_EXISTS');
    }

    const existingPhone = await this.userRepo.findByPhoneNumber(phoneNumber);
    if (existingPhone) {
      throw new AppException('USER.PHONE_ALREADY_EXISTS');
    }

    const passwordHash = await this.passwordHasher.hashPassword(input.account.password);
    const isWorker = roles.includes('WORKER');

    const result = await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);

      const duplicateEmail = await userRepo.findOne({ where: { email } });
      if (duplicateEmail) {
        throw new AppException('USER.EMAIL_ALREADY_EXISTS');
      }

      const duplicatePhone = await userRepo.findOne({ where: { phoneNumber } });
      if (duplicatePhone) {
        throw new AppException('USER.PHONE_ALREADY_EXISTS');
      }

      const created = await userRepo.save(
        userRepo.create({
          fullName: input.account.fullName.trim(),
          email,
          phoneNumber,
          passwordHash,
          roles: roles as any,
          status: 'ACTIVE',
          emailVerified: input.emailVerified,
          phoneVerified: input.phoneVerified,
          countryCode: input.location.countryCode.trim().toUpperCase(),
          city: input.location.city.trim(),
          municipality: input.location.municipality.trim(),
          area: input.location.area.trim(),
          coverageRadiusKm: isWorker ? (input.location.coverageRadiusKm ?? null) : null,
          workerCategories: isWorker ? input.workerProfile?.categories ?? null : null,
          workerHeadline: isWorker ? (input.workerProfile?.headline?.trim() || null) : null,
          workerBio: isWorker ? (input.workerProfile?.bio?.trim() || null) : null,
          preferredPaymentMethod: input.preferredPaymentMethod ?? null,
          documentType: isWorker ? (input.personalInfo?.documentType ?? null) : null,
          documentNumber: isWorker ? (input.personalInfo?.documentNumber?.trim() ?? null) : null,
          birthDate: isWorker ? (input.personalInfo?.birthDate?.trim() ?? null) : null,
          gender: isWorker ? (input.personalInfo?.gender ?? null) : null,
          nationality: isWorker ? (input.personalInfo?.nationality?.trim().toUpperCase() ?? null) : null,
        }),
      );

      return { userId: created.id };
    });

    this.logger.debug('Done', result);
    return result;
  }

  private assertReady(input: CompleteOnboardingRegistrationInput, roles: UserRole[]): void {
    const fieldErrors: Record<string, string> = {};
    const isWorker = roles.includes('WORKER');
    const isClientOnly = roles.includes('CLIENT') && !isWorker;

    if (!input.emailVerified) {
      fieldErrors.emailVerification = 'Email verification is required.';
    }

    if (isWorker && !input.phoneVerified) {
      fieldErrors.phoneVerification = 'Phone verification is required for WORKER.';
    }

    if (isClientOnly && !(input.emailVerified || input.phoneVerified)) {
      fieldErrors.contactVerification = 'At least one verification is required for CLIENT.';
    }

    const locationErrors = validateSupportedLocation(input.location);
    if (locationErrors) {
      Object.assign(fieldErrors, locationErrors);
    }

    if (isWorker && (!input.workerProfile?.categories || input.workerProfile.categories.length < 1)) {
      fieldErrors.workerCategories = 'At least one category is required for WORKER.';
    }

    if (isWorker) {
      const p = input.personalInfo;
      if (!p?.documentType) {
        fieldErrors.documentType = 'Document type is required for WORKER.';
      }
      if (!p?.documentNumber?.trim()) {
        fieldErrors.documentNumber = 'Document number is required for WORKER.';
      }
      if (!p?.birthDate?.trim()) {
        fieldErrors.birthDate = 'Birth date is required for WORKER.';
      } else if (!isAdultBirthDate(p.birthDate)) {
        fieldErrors.birthDate = 'You must be at least 18 years old.';
      }
      if (!p?.gender) {
        fieldErrors.gender = 'Gender is required for WORKER.';
      }
      const nationality = p?.nationality?.trim().toUpperCase() ?? '';
      if (!nationality) {
        fieldErrors.nationality = 'Nationality is required for WORKER.';
      } else if (!isIsoCountryCode(nationality)) {
        fieldErrors.nationality = 'Nationality must be a valid ISO country code (e.g. CO, ES, AR).';
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new AppException('VALIDATION.INVALID_INPUT', undefined, { fieldErrors });
    }
  }
}
