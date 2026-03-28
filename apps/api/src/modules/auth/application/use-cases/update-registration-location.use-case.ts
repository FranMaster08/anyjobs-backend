import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_REGISTRATION_FLOW_STORE } from '../ports';
import type { RegistrationFlowStorePort } from '../ports';
import { UserProfilePolicy } from '../../../user-profile/domain/policies/user-profile.policy';

export interface UpdateRegistrationLocationInput {
  flowId: string;
  city: string;
  area?: string;
  countryCode?: string;
  coverageRadiusKm?: number;
}

@Injectable()
export class UpdateRegistrationLocationUseCase {
  constructor(
    @Inject(AUTH_REGISTRATION_FLOW_STORE) private readonly flowStore: RegistrationFlowStorePort,
  ) {}

  async execute(input: UpdateRegistrationLocationInput): Promise<void> {
    const flow = await this.flowStore.getFlow(input.flowId);
    if (!flow || flow.completedAt) throw new UnauthorizedException();

    await this.flowStore.updateFlow(input.flowId, {
      ...UserProfilePolicy.buildPatchForLocation(input),
      nextStage: 'ROLE_PROFILE',
    });
  }
}
