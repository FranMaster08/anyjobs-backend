import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppException } from '../../../../shared/errors/app-exception';
import { AUTH_REGISTRATION_FLOW_STORE } from '../ports';
import type { RegistrationFlowStorePort } from '../ports';
import { UserProfilePolicy } from '../../../user-profile/domain/policies/user-profile.policy';

export interface UpdateRegistrationPersonalInfoInput {
  flowId: string;
  documentType?: 'DNI' | 'NIE' | 'PASSPORT';
  documentNumber?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  nationality?: string;
}

@Injectable()
export class UpdateRegistrationPersonalInfoUseCase {
  constructor(
    @Inject(AUTH_REGISTRATION_FLOW_STORE) private readonly flowStore: RegistrationFlowStorePort,
  ) {}

  async execute(input: UpdateRegistrationPersonalInfoInput): Promise<void> {
    const flow = await this.flowStore.getFlow(input.flowId);
    if (!flow || flow.completedAt) throw new UnauthorizedException();

    const validationError = UserProfilePolicy.validatePersonalInfoRequiredForWorker(flow.roles as any, input);
    if (validationError) {
      throw new AppException('VALIDATION.INVALID_INPUT', undefined, validationError);
    }

    await this.flowStore.updateFlow(input.flowId, {
      ...UserProfilePolicy.buildPatchForPersonalInfo({
        documentType: input.documentType as 'DNI' | 'NIE' | 'PASSPORT',
        documentNumber: input.documentNumber as string,
        birthDate: input.birthDate as string,
        gender: input.gender,
        nationality: input.nationality,
      }),
      nextStage: 'PERSONAL_INFO',
    });
  }
}
