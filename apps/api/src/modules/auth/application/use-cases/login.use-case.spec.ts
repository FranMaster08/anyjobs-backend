import { UnauthorizedException } from '@nestjs/common';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { LoginUseCase } from './login.use-case';

describe(LoginUseCase.name, () => {
  const correlationIdService = new CorrelationIdService();
  const configService = { get: () => false } as any;

  it('throws 401 when user does not exist', async () => {
    const userRepo = { findByEmail: jest.fn().mockResolvedValue(null) } as any;
    const passwordHasher = { verifyPassword: jest.fn() } as any;
    const tokenService = { issueToken: jest.fn() } as any;
    const uc = new LoginUseCase(userRepo, passwordHasher, tokenService, correlationIdService, configService);

    await expect(uc.execute({ email: 'x@y.com', password: 'p' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns token and user snapshot on success', async () => {
    const userRepo = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'u1',
        fullName: 'Test',
        email: 'x@y.com',
        roles: ['CLIENT'],
        passwordHash: 'hash',
        phoneNumber: '+34000',
        status: 'PENDING',
        emailVerified: false,
        phoneVerified: false,
        createdAt: '2026-03-01T00:00:00.000Z',
      }),
    } as any;
    const passwordHasher = { verifyPassword: jest.fn().mockResolvedValue(true) } as any;
    const tokenService = { issueToken: jest.fn().mockResolvedValue('tok') } as any;

    const uc = new LoginUseCase(userRepo, passwordHasher, tokenService, correlationIdService, configService);
    const res = await uc.execute({ email: 'x@y.com', password: 'p' });

    expect(res.token).toBe('tok');
    expect(res.user).toMatchObject({ id: 'u1', email: 'x@y.com' });
  });
});

