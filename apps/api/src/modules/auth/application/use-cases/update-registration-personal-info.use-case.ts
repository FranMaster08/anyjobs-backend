import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppException } from '../../../../shared/errors/app-exception';
import { AUTH_REGISTRATION_FLOW_STORE } from '../ports';
import type { RegistrationFlowStorePort } from '../ports';
import { UserProfilePolicy } from '../../../user-profile/domain/policies/user-profile.policy';
import type { DocumentType } from '../../../user-profile/domain/types/document-type.type';
import type { Gender } from '../../../user-profile/domain/types/gender.type';

export interface UpdateRegistrationPersonalInfoInput {
  flowId: string;
  documentType?: DocumentType;
  documentNumber?: string;
  birthDate?: string;
  gender?: Gender;
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
        documentType: input.documentType as DocumentType,
        documentNumber: input.documentNumber as string,
        birthDate: input.birthDate as string,
        gender: input.gender,
        nationality: input.nationality,
      }),
      nextStage: 'PERSONAL_INFO',
    });
  }
}
