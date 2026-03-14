import { Module } from '@nestjs/common';
import { AuthController } from './api/controllers/auth.controller';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { VerifyEmailOtpUseCase } from './application/use-cases/verify-email-otp.use-case';
import { VerifyPhoneOtpUseCase } from './application/use-cases/verify-phone-otp.use-case';
import { CheckEmailAvailableUseCase } from './application/use-cases/check-email-available.use-case';
import { CheckPhoneAvailableUseCase } from './application/use-cases/check-phone-available.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import {
  AUTH_PASSWORD_HASHER,
  AUTH_REGISTRATION_FLOW_STORE,
  AUTH_TOKEN_SERVICE,
  AUTH_USER_REPOSITORY,
} from './application/ports/tokens';
import { ScryptPasswordHasher } from './infrastructure/adapters/scrypt-password-hasher';
import { UuidTokenService } from './infrastructure/adapters/uuid-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../shared/persistence/entities';
import { RegistrationFlowEntity } from './infrastructure/entities/registration-flow.entity';
import { TypeOrmAuthUserRepository } from './infrastructure/adapters/typeorm-auth-user.repository';
import { TypeOrmRegistrationFlowStore } from './infrastructure/adapters/typeorm-registration-flow.store';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RegistrationFlowEntity])],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    VerifyEmailOtpUseCase,
    VerifyPhoneOtpUseCase,
    CheckEmailAvailableUseCase,
    CheckPhoneAvailableUseCase,
    LoginUseCase,
    { provide: AUTH_USER_REPOSITORY, useClass: TypeOrmAuthUserRepository },
    { provide: AUTH_PASSWORD_HASHER, useClass: ScryptPasswordHasher },
    { provide: AUTH_TOKEN_SERVICE, useClass: UuidTokenService },
    { provide: AUTH_REGISTRATION_FLOW_STORE, useClass: TypeOrmRegistrationFlowStore },
  ],
})
export class AuthModule {}

