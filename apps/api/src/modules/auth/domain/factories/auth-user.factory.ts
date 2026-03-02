import type { NewAuthUser } from '../types/new-auth-user.type';
import type { UserRole } from '../types/user-role.type';
import { Email } from '../value-objects/email.value-object';
import { PhoneNumber } from '../value-objects/phone-number.value-object';

export class AuthUserFactory {
  static buildPendingRegistration(input: {
    fullName: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
    roles: UserRole[];
  }): NewAuthUser {
    return {
      fullName: input.fullName.trim(),
      email: Email.create(input.email).value,
      phoneNumber: PhoneNumber.create(input.phoneNumber).value,
      passwordHash: input.passwordHash,
      roles: input.roles,
      status: 'PENDING',
      emailVerified: false,
      phoneVerified: false,
    };
  }
}

