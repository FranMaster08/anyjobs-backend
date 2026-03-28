import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { AppException } from '../../../../shared/errors/app-exception';
import { createAppLogger } from '../../../../shared/logging/app-logger';
import { AUTH_PASSWORD_HASHER, AUTH_REGISTRATION_FLOW_STORE, AUTH_USER_REPOSITORY } from '../ports';
import type { PasswordHasherPort, RegistrationFlowState, RegistrationFlowStorePort, UserRepositoryPort } from '../ports';
import type { UserRole } from '../../domain';
import { Email, PhoneNumber } from '../../domain';

const REGISTRATION_FLOW_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export interface RegisterInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: UserRole[];
}

export interface RegisterResult {
  status: 'PENDING';
  emailVerificationRequired: boolean;
  phoneVerificationRequired: boolean;
  nextStage: 'VERIFY';
  flowId: string;
}

@Injectable()
export class RegisterUseCase {
  private readonly logger;

  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
    @Inject(AUTH_PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort,
    @Inject(AUTH_REGISTRATION_FLOW_STORE) private readonly flowStore: RegistrationFlowStorePort,
    correlationIdService: CorrelationIdService,
    configService: ConfigService,
  ) {
    const debugPayloads = configService.get<boolean>('logging.debugPayloads') ?? false;
    this.logger = createAppLogger(RegisterUseCase.name, correlationIdService, debugPayloads);
  }

  async execute(input: RegisterInput): Promise<RegisterResult> {
    this.logger.debug('Start', { email: input.email, roles: input.roles });

    const email = Email.create(input.email).value;
    const phoneNumber = PhoneNumber.create(input.phoneNumber).value;

    const existingEmail = await this.userRepo.findByEmail(email);
    if (existingEmail) {
      throw new AppException('USER.EMAIL_ALREADY_EXISTS');
    }

    const existingDraftEmail = await this.flowStore.findActiveFlowByEmail(email);
    if (existingDraftEmail) {
      throw new AppException('USER.EMAIL_ALREADY_EXISTS');
    }

    const existingPhone = await this.userRepo.findByPhoneNumber(phoneNumber);
    if (existingPhone) {
      throw new AppException('USER.PHONE_ALREADY_EXISTS');
    }

    const existingDraftPhone = await this.flowStore.findActiveFlowByPhoneNumber(phoneNumber);
    if (existingDraftPhone) {
      throw new AppException('USER.PHONE_ALREADY_EXISTS');
    }

    const passwordHash = await this.passwordHasher.hashPassword(input.password);
    const flowExpiresAt = new Date(Date.now() + REGISTRATION_FLOW_TTL_MS).toISOString();

    const flow: RegistrationFlowState = await this.flowStore.createFlow({
      fullName: input.fullName.trim(),
      email,
      phoneNumber,
      passwordHash,
      roles: input.roles,
      status: 'PENDING',
      nextStage: 'VERIFY',
      emailVerified: false,
      phoneVerified: false,
      expiresAt: flowExpiresAt,
    });

    this.logger.debug('Done', { flowId: flow.flowId });

    return {
      status: 'PENDING',
      emailVerificationRequired: true,
      phoneVerificationRequired: input.roles.includes('WORKER'),
      nextStage: 'VERIFY',
      flowId: flow.flowId,
    };
  }
}

