import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppException } from '../../../../shared/errors/app-exception';
import { AUTH_REGISTRATION_FLOW_STORE } from '../ports';
import type { RegistrationFlowStorePort } from '../ports';
import { UserProfilePolicy } from '../../../user-profile/domain/policies/user-profile.policy';

export interface UpdateRegistrationWorkerProfileInput {
  flowId: string;
  categories: string[];
  headline?: string;
  bio?: string;
}

@Injectable()
export class UpdateRegistrationWorkerProfileUseCase {
  constructor(
    @Inject(AUTH_REGISTRATION_FLOW_STORE) private readonly flowStore: RegistrationFlowStorePort,
  ) {}

  async execute(input: UpdateRegistrationWorkerProfileInput): Promise<void> {
    const flow = await this.flowStore.getFlow(input.flowId);
    if (!flow || flow.completedAt) throw new UnauthorizedException();

    const validationError = UserProfilePolicy.validateWorkerProfileUpdate(flow.roles as any, input.categories);
    if (validationError) {
      throw new AppException('VALIDATION.INVALID_INPUT', undefined, {
        fieldErrors: validationError.fieldErrors,
      });
    }

    await this.flowStore.updateFlow(input.flowId, {
      ...UserProfilePolicy.buildPatchForWorkerProfile(input),
      nextStage: 'PERSONAL_INFO',
    });
  }
}
