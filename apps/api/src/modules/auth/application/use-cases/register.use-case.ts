import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { AppException } from '../../../../shared/errors/app-exception';
import { createAppLogger } from '../../../../shared/logging/app-logger';
import { AUTH_PASSWORD_HASHER, AUTH_REGISTRATION_FLOW_STORE, AUTH_USER_REPOSITORY } from '../ports';
import type { PasswordHasherPort, RegistrationFlowState, RegistrationFlowStorePort, UserRepositoryPort } from '../ports';
import type { UserRole } from '../../domain';
import { Email, PhoneNumber } from '../../domain';
import { isRegistrationFlowActive } from '../registration-flow.utils';

const REGISTRATION_FLOW_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export interface RegisterInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: UserRole[];
  /** Flow de la cookie `aj_reg_flow`, si existe. */
  resumeFlowId?: string;
}

export interface RegisterResult {
  status: 'PENDING';
  emailVerificationRequired: boolean;
  phoneVerificationRequired: boolean;
  nextStage: RegistrationFlowState['nextStage'];
  flowId: string;
  resumed: boolean;
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
    this.logger.debug('Start', { email: input.email, roles: input.roles, resumeFlowId: input.resumeFlowId });

    const email = Email.create(input.email).value;
    const phoneNumber = PhoneNumber.create(input.phoneNumber).value;

    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new AppException('USER.EMAIL_ALREADY_EXISTS');
    }

    const existingUserPhone = await this.userRepo.findByPhoneNumber(phoneNumber);
    if (existingUserPhone) {
      throw new AppException('USER.PHONE_ALREADY_EXISTS');
    }

    const passwordHash = await this.passwordHasher.hashPassword(input.password);
    const flowExpiresAt = new Date(Date.now() + REGISTRATION_FLOW_TTL_MS).toISOString();

    const flowToResume = await this.resolveFlowToResume(input, email, phoneNumber);
    if (flowToResume) {
      return this.resumeDraft(flowToResume, input, phoneNumber, passwordHash, flowExpiresAt);
    }

    const phoneDraft = await this.flowStore.findActiveFlowByPhoneNumber(phoneNumber);
    if (phoneDraft) {
      throw new AppException('USER.PHONE_ALREADY_EXISTS');
    }

    const flow = await this.flowStore.createFlow({
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

    this.logger.debug('Done', { flowId: flow.flowId, resumed: false });

    return {
      status: 'PENDING',
      emailVerificationRequired: true,
      phoneVerificationRequired: input.roles.includes('WORKER'),
      nextStage: 'VERIFY',
      flowId: flow.flowId,
      resumed: false,
    };
  }

  private async resolveFlowToResume(
    input: RegisterInput,
    email: string,
    phoneNumber: string,
  ): Promise<RegistrationFlowState | null> {
    if (input.resumeFlowId) {
      const byCookie = await this.flowStore.getFlow(input.resumeFlowId);
      if (byCookie && isRegistrationFlowActive(byCookie) && byCookie.email === email) {
        return byCookie;
      }
    }

    const byEmail = await this.flowStore.findActiveFlowByEmail(email);
    if (byEmail && isRegistrationFlowActive(byEmail)) {
      return byEmail;
    }

    const phoneDraft = await this.flowStore.findActiveFlowByPhoneNumber(phoneNumber);
    if (phoneDraft && phoneDraft.email !== email) {
      throw new AppException('USER.PHONE_ALREADY_EXISTS');
    }

    return null;
  }

  private async resumeDraft(
    flow: RegistrationFlowState,
    input: RegisterInput,
    phoneNumber: string,
    passwordHash: string,
    flowExpiresAt: string,
  ): Promise<RegisterResult> {
    if (flow.phoneNumber !== phoneNumber) {
      const otherPhoneDraft = await this.flowStore.findActiveFlowByPhoneNumber(phoneNumber);
      if (otherPhoneDraft && otherPhoneDraft.flowId !== flow.flowId) {
        throw new AppException('USER.PHONE_ALREADY_EXISTS');
      }
    }

    const updated = await this.flowStore.updateFlow(flow.flowId, {
      fullName: input.fullName.trim(),
      phoneNumber,
      passwordHash,
      roles: input.roles,
      expiresAt: flowExpiresAt,
    });

    const state = updated ?? flow;
    this.logger.debug('Done', { flowId: state.flowId, resumed: true, nextStage: state.nextStage });

    return {
      status: 'PENDING',
      emailVerificationRequired: !state.emailVerified,
      phoneVerificationRequired: input.roles.includes('WORKER') && !state.phoneVerified,
      nextStage: state.nextStage,
      flowId: state.flowId,
      resumed: true,
    };
  }
}
