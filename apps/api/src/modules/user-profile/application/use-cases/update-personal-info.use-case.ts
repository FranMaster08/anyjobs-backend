import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../../../shared/errors/app-exception';
import { USER_PROFILE_USER_REPOSITORY } from '../ports';
import type { UserProfileRepositoryPort } from '../ports';
import type { UserRole } from '../../domain';
import { UserProfilePolicy } from '../../domain';

export interface UpdatePersonalInfoInput {
  userId: string;
  actorRoles: UserRole[];
  documentType: 'DNI' | 'NIE' | 'PASSPORT';
  documentNumber: string;
  birthDate: string; // YYYY-MM-DD
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  nationality?: string;
}

@Injectable()
export class UpdatePersonalInfoUseCase {
  constructor(
    @Inject(USER_PROFILE_USER_REPOSITORY) private readonly repo: UserProfileRepositoryPort,
  ) {}

  async execute(input: UpdatePersonalInfoInput): Promise<void> {
    const user = await this.repo.findById(input.userId);
    if (!user) throw new AppException('USER.NOT_FOUND');

    const validationError = UserProfilePolicy.validatePersonalInfoRequiredForWorker(input.actorRoles, input);
    if (validationError) throw new AppException('VALIDATION.INVALID_INPUT', undefined, validationError);

    await this.repo.update(input.userId, UserProfilePolicy.buildPatchForPersonalInfo(input));
  }
}

