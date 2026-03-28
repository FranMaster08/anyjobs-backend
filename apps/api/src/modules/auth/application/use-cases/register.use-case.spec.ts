import { AppException } from '../../../../shared/errors/app-exception';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { RegisterUseCase } from './register.use-case';

describe(RegisterUseCase.name, () => {
  const correlationIdService = new CorrelationIdService();
  const configService = { get: () => false } as any;

  it('registers a new draft flow without creating a user', async () => {
    const userRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByPhoneNumber: jest.fn().mockResolvedValue(null),
    } as any;

    const passwordHasher = { hashPassword: jest.fn().mockResolvedValue('hash') } as any;
    const flowStore = {
      findActiveFlowByEmail: jest.fn().mockResolvedValue(null),
      findActiveFlowByPhoneNumber: jest.fn().mockResolvedValue(null),
      createFlow: jest.fn().mockResolvedValue({ flowId: 'flow-1' }),
    } as any;

    const uc = new RegisterUseCase(userRepo, passwordHasher, flowStore, correlationIdService, configService);

    const res = await uc.execute({
      fullName: 'Test User',
      email: 'TEST@EXAMPLE.COM',
      phoneNumber: '+34000',
      password: 'secret',
      roles: ['WORKER'],
    });

    expect(res).toMatchObject({
      status: 'PENDING',
      nextStage: 'VERIFY',
      flowId: 'flow-1',
    });
    expect(flowStore.createFlow).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+34000',
        passwordHash: 'hash',
        roles: ['WORKER'],
        status: 'PENDING',
        nextStage: 'VERIFY',
        emailVerified: false,
        phoneVerified: false,
      }),
    );
  });

  it('throws when email already exists', async () => {
    const userRepo = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'x' }),
      findByPhoneNumber: jest.fn(),
    } as any;
    const passwordHasher = { hashPassword: jest.fn() } as any;
    const flowStore = { findActiveFlowByEmail: jest.fn(), createFlow: jest.fn() } as any;

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

