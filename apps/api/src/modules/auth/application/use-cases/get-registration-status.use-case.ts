import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REGISTRATION_FLOW_STORE } from '../ports';
import type { RegistrationFlowState, RegistrationFlowStorePort } from '../ports/registration-flow-store.port';
import { isRegistrationFlowActive } from '../registration-flow.utils';

export interface GetRegistrationStatusInput {
  flowId: string;
}

export interface GetRegistrationStatusResult {
  active: boolean;
  status?: 'PENDING' | 'ACTIVE';
  nextStage?: RegistrationFlowState['nextStage'];
  roles?: RegistrationFlowState['roles'];
  emailVerified?: boolean;
  phoneVerified?: boolean;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
}

@Injectable()
export class GetRegistrationStatusUseCase {
  constructor(
    @Inject(AUTH_REGISTRATION_FLOW_STORE) private readonly flowStore: RegistrationFlowStorePort,
  ) {}

  async execute(input: GetRegistrationStatusInput): Promise<GetRegistrationStatusResult> {
    const flow = await this.flowStore.getFlow(input.flowId);
    if (!flow || !isRegistrationFlowActive(flow)) {
      return { active: false };
    }

    return {
      active: true,
      status: flow.status,
      nextStage: flow.nextStage,
      roles: flow.roles,
      emailVerified: flow.emailVerified,
      phoneVerified: flow.phoneVerified,
      email: flow.email,
      phoneNumber: flow.phoneNumber,
      fullName: flow.fullName,
    };
  }
}
