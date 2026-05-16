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
      getFlow: jest.fn(),
      createFlow: jest.fn().mockResolvedValue({ flowId: 'flow-1', nextStage: 'VERIFY', emailVerified: false, phoneVerified: false }),
      updateFlow: jest.fn(),
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
      resumed: false,
    });
    expect(flowStore.createFlow).toHaveBeenCalled();
  });

  it('resumes an active draft for the same email instead of failing', async () => {
    const existingDraft = {
      flowId: 'flow-existing',
      email: 'test@example.com',
      phoneNumber: '+34000',
      nextStage: 'LOCATION',
      emailVerified: true,
      phoneVerified: true,
      completedAt: undefined,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };

    const userRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByPhoneNumber: jest.fn().mockResolvedValue(null),
    } as any;
    const passwordHasher = { hashPassword: jest.fn().mockResolvedValue('new-hash') } as any;
    const flowStore = {
      findActiveFlowByEmail: jest.fn().mockResolvedValue(existingDraft),
      findActiveFlowByPhoneNumber: jest.fn().mockResolvedValue(existingDraft),
      getFlow: jest.fn(),
      createFlow: jest.fn(),
      updateFlow: jest.fn().mockResolvedValue({ ...existingDraft, fullName: 'Updated' }),
    } as any;

    const uc = new RegisterUseCase(userRepo, passwordHasher, flowStore, correlationIdService, configService);

    const res = await uc.execute({
      fullName: 'Updated',
      email: 'test@example.com',
      phoneNumber: '+34000',
      password: 'secret',
      roles: ['WORKER'],
    });

    expect(res.resumed).toBe(true);
    expect(res.flowId).toBe('flow-existing');
    expect(res.nextStage).toBe('LOCATION');
    expect(flowStore.createFlow).not.toHaveBeenCalled();
    expect(flowStore.updateFlow).toHaveBeenCalled();
  });

  it('throws when email already exists on a definitive user', async () => {
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
