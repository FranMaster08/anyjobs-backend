import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_REGISTRATION_FLOW_STORE } from '../ports';
import type { RegistrationFlowStorePort } from '../ports';
import { UserProfilePolicy } from '../../../user-profile/domain/policies/user-profile.policy';

export interface UpdateRegistrationClientProfileInput {
  flowId: string;
  preferredPaymentMethod: 'CARD' | 'TRANSFER' | 'CASH' | 'WALLET';
}

@Injectable()
export class UpdateRegistrationClientProfileUseCase {
  constructor(
    @Inject(AUTH_REGISTRATION_FLOW_STORE) private readonly flowStore: RegistrationFlowStorePort,
  ) {}

  async execute(input: UpdateRegistrationClientProfileInput): Promise<void> {
    const flow = await this.flowStore.getFlow(input.flowId);
    if (!flow || flow.completedAt) throw new UnauthorizedException();

    await this.flowStore.updateFlow(input.flowId, {
      ...UserProfilePolicy.buildPatchForClientProfile(input),
      nextStage: 'PERSONAL_INFO',
    });
  }
}
