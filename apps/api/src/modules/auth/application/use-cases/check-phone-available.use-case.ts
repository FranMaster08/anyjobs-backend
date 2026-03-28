import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REGISTRATION_FLOW_STORE, AUTH_USER_REPOSITORY } from '../ports';
import type { RegistrationFlowStorePort, UserRepositoryPort } from '../ports';
import { PhoneNumber } from '../../domain';

export interface CheckPhoneAvailableInput {
  phoneNumber: string;
}

export interface CheckPhoneAvailableResult {
  available: boolean;
}

@Injectable()
export class CheckPhoneAvailableUseCase {
  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
    @Inject(AUTH_REGISTRATION_FLOW_STORE) private readonly flowStore: RegistrationFlowStorePort,
  ) {}

  async execute(input: CheckPhoneAvailableInput): Promise<CheckPhoneAvailableResult> {
    const phoneNumber = PhoneNumber.create(input.phoneNumber).value;
    const foundUser = await this.userRepo.findByPhoneNumber(phoneNumber);
    const foundDraft = await this.flowStore.findActiveFlowByPhoneNumber(phoneNumber);
    return { available: !foundUser && !foundDraft };
  }
}

