import { Inject, Injectable } from '@nestjs/common';
import { AUTH_USER_REPOSITORY } from '../ports';
import type { UserRepositoryPort } from '../ports';
import { PhoneNumber } from '../../domain';

export interface CheckPhoneAvailableInput {
  phoneNumber: string;
}

export interface CheckPhoneAvailableResult {
  available: boolean;
}

@Injectable()
export class CheckPhoneAvailableUseCase {
  constructor(@Inject(AUTH_USER_REPOSITORY) private readonly userRepo: UserRepositoryPort) {}

  async execute(input: CheckPhoneAvailableInput): Promise<CheckPhoneAvailableResult> {
    const phoneNumber = PhoneNumber.create(input.phoneNumber).value;
    const found = await this.userRepo.findByPhoneNumber(phoneNumber);
    return { available: !found };
  }
}

