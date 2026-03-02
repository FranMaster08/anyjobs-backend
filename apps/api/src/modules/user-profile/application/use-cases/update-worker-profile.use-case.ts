import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../../../shared/errors/app-exception';
import { USER_PROFILE_USER_REPOSITORY } from '../ports';
import type { UserProfileRepositoryPort } from '../ports';
import type { UserRole } from '../../domain';
import { UserProfilePolicy } from '../../domain';

export interface UpdateWorkerProfileInput {
  userId: string;
  actorRoles: UserRole[];
  categories: string[];
  headline?: string;
  bio?: string;
}

@Injectable()
export class UpdateWorkerProfileUseCase {
  constructor(
    @Inject(USER_PROFILE_USER_REPOSITORY) private readonly repo: UserProfileRepositoryPort,
  ) {}

  async execute(input: UpdateWorkerProfileInput): Promise<void> {
    const user = await this.repo.findById(input.userId);
    if (!user) throw new AppException('USER.NOT_FOUND');

    const validationError = UserProfilePolicy.validateWorkerProfileUpdate(input.actorRoles, input.categories);
    if (validationError) {
      throw new AppException('VALIDATION.INVALID_INPUT', undefined, {
        fieldErrors: validationError.fieldErrors,
      });
    }

    await this.repo.update(input.userId, UserProfilePolicy.buildPatchForWorkerProfile(input));
  }
}

