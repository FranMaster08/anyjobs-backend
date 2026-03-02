import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { createAppLogger } from '../../../../shared/logging/app-logger';
import { AUTH_REGISTRATION_FLOW_STORE, AUTH_USER_REPOSITORY } from '../ports';
import type { RegistrationFlowStorePort, UserRepositoryPort } from '../ports';

export interface VerifyPhoneOtpInput {
  flowId: string;
  otpCode: string;
}

@Injectable()
export class VerifyPhoneOtpUseCase {
  private readonly logger;

  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
    @Inject(AUTH_REGISTRATION_FLOW_STORE) private readonly flowStore: RegistrationFlowStorePort,
    correlationIdService: CorrelationIdService,
    configService: ConfigService,
  ) {
    const debugPayloads = configService.get<boolean>('logging.debugPayloads') ?? false;
    this.logger = createAppLogger(VerifyPhoneOtpUseCase.name, correlationIdService, debugPayloads);
  }

  async execute(input: VerifyPhoneOtpInput): Promise<void> {
    this.logger.debug('Start');

    const flow = await this.flowStore.getFlow(input.flowId);
    if (!flow) throw new UnauthorizedException();

    const user = await this.userRepo.findById(flow.userId);
    if (!user) throw new UnauthorizedException();

    // MVP: no validación real de OTP.
    await this.userRepo.update(user.id, { phoneVerified: true });
    await this.flowStore.updateFlow(flow.flowId, { phoneVerified: true });

    this.logger.debug('Done', { userId: user.id });
  }
}

