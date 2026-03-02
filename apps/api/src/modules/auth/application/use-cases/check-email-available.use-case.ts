import { Inject, Injectable } from '@nestjs/common';
import { AUTH_USER_REPOSITORY } from '../ports';
import type { UserRepositoryPort } from '../ports';
import { Email } from '../../domain';

export interface CheckEmailAvailableInput {
  email: string;
}

export interface CheckEmailAvailableResult {
  available: boolean;
}

@Injectable()
export class CheckEmailAvailableUseCase {
  constructor(@Inject(AUTH_USER_REPOSITORY) private readonly userRepo: UserRepositoryPort) {}

  async execute(input: CheckEmailAvailableInput): Promise<CheckEmailAvailableResult> {
    const email = Email.create(input.email).value;
    const found = await this.userRepo.findByEmail(email);
    return { available: !found };
  }
}

