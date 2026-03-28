import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REGISTRATION_FLOW_STORE, AUTH_USER_REPOSITORY } from '../ports';
import type { RegistrationFlowStorePort, UserRepositoryPort } from '../ports';
import { Email } from '../../domain';

export interface CheckEmailAvailableInput {
  email: string;
}

export interface CheckEmailAvailableResult {
  available: boolean;
}

@Injectable()
export class CheckEmailAvailableUseCase {
  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
    @Inject(AUTH_REGISTRATION_FLOW_STORE) private readonly flowStore: RegistrationFlowStorePort,
  ) {}

  async execute(input: CheckEmailAvailableInput): Promise<CheckEmailAvailableResult> {
    const email = Email.create(input.email).value;
    const foundUser = await this.userRepo.findByEmail(email);
    const foundDraft = await this.flowStore.findActiveFlowByEmail(email);
    return { available: !foundUser && !foundDraft };
  }
}

