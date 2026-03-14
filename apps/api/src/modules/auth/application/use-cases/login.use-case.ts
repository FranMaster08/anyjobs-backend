import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { createAppLogger } from '../../../../shared/logging/app-logger';
import { AUTH_PASSWORD_HASHER, AUTH_TOKEN_SERVICE, AUTH_USER_REPOSITORY } from '../ports';
import type { PasswordHasherPort, TokenServicePort, UserRepositoryPort } from '../ports';
import type { AuthUser } from '../../domain';
import { Email } from '../../domain';
import { AuthTokenRegistry } from '../../infrastructure/adapters/auth-token-registry';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: Pick<AuthUser, 'id' | 'fullName' | 'email' | 'roles'> &
    Partial<Omit<AuthUser, 'passwordHash'>>;
}

@Injectable()
export class LoginUseCase {
  private readonly logger;

  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
    @Inject(AUTH_PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort,
    @Inject(AUTH_TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
    private readonly tokenRegistry: AuthTokenRegistry,
    correlationIdService: CorrelationIdService,
    configService: ConfigService,
  ) {
    const debugPayloads = configService.get<boolean>('logging.debugPayloads') ?? false;
    this.logger = createAppLogger(LoginUseCase.name, correlationIdService, debugPayloads);
  }

  async execute(input: LoginInput): Promise<LoginResult> {
    const email = Email.create(input.email).value;
    this.logger.debug('Start', { email });

    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    const ok = await this.passwordHasher.verifyPassword(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException();

    const token = await this.tokenService.issueToken(user.id);
    this.tokenRegistry.register(token, { userId: user.id, roles: user.roles as unknown as string[] });

    const { passwordHash: _ph, ...safeUser } = user;

    this.logger.debug('Done', { userId: user.id });

    return {
      token,
      user: safeUser,
    };
  }
}

