import { AppException } from '../../../../shared/errors/app-exception';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { RegisterUseCase } from './register.use-case';

describe(RegisterUseCase.name, () => {
  const correlationIdService = new CorrelationIdService();
  const configService = { get: () => false } as any;

  it('registers a new pending user and creates a flow', async () => {
    const userRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByPhoneNumber: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(async (u: any) => ({
        ...u,
        id: 'user-1',
        createdAt: '2026-03-01T00:00:00.000Z',
      })),
    } as any;

    const passwordHasher = { hashPassword: jest.fn().mockResolvedValue('hash') } as any;
    const flowStore = { createFlow: jest.fn().mockResolvedValue({ flowId: 'flow-1' }) } as any;

    const uc = new RegisterUseCase(userRepo, passwordHasher, flowStore, correlationIdService, configService);

    const res = await uc.execute({
      fullName: 'Test User',
      email: 'TEST@EXAMPLE.COM',
      phoneNumber: '+34000',
      password: 'secret',
      roles: ['WORKER'],
    });

    expect(res).toMatchObject({
      userId: 'user-1',
      status: 'PENDING',
      nextStage: 'VERIFY',
      flowId: 'flow-1',
    });
    expect(userRepo.create).toHaveBeenCalled();
  });

  it('throws when email already exists', async () => {
    const userRepo = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'x' }),
      findByPhoneNumber: jest.fn(),
      create: jest.fn(),
    } as any;
    const passwordHasher = { hashPassword: jest.fn() } as any;
    const flowStore = { createFlow: jest.fn() } as any;

    const uc = new RegisterUseCase(userRepo, passwordHasher, flowStore, correlationIdService, configService);

    await expect(
      uc.execute({
        fullName: 'Test',
        email: 'test@example.com',
        phoneNumber: '+34000',
        password: 'secret',
        roles: ['CLIENT'],
      }),
    ).rejects.toBeInstanceOf(AppException);
  });
});

