import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../../../shared/errors/app-exception';
import { USER_PROFILE_USER_REPOSITORY } from '../ports';
import type { UserProfileRepositoryPort } from '../ports';
import { UserProfilePolicy } from '../../domain';

export interface UpdateClientProfileInput {
  userId: string;
  preferredPaymentMethod: 'CARD' | 'TRANSFER' | 'CASH' | 'WALLET';
}

@Injectable()
export class UpdateClientProfileUseCase {
  constructor(
    @Inject(USER_PROFILE_USER_REPOSITORY) private readonly repo: UserProfileRepositoryPort,
  ) {}

  async execute(input: UpdateClientProfileInput): Promise<void> {
    const user = await this.repo.findById(input.userId);
    if (!user) throw new AppException('USER.NOT_FOUND');

    await this.repo.update(input.userId, UserProfilePolicy.buildPatchForClientProfile(input));
  }
}

