import { UnauthorizedException } from '@nestjs/common';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { AppException } from '../../../../shared/errors/app-exception';
import { CompleteRegistrationUseCase } from './complete-registration.use-case';
import { RegistrationFlowEntity } from '../../infrastructure/entities/registration-flow.entity';
import { UserEntity } from '../../../../shared/persistence/entities';

describe(CompleteRegistrationUseCase.name, () => {
  const correlationIdService = new CorrelationIdService();
  const configService = { get: () => false } as any;

  function buildFlowEntity(
    overrides: Partial<RegistrationFlowEntity> = {},
  ): RegistrationFlowEntity {
    return {
      flowId: 'flow-1',
      userId: null,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      expiresAt: null,
      completedAt: null,
      fullName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '+34600111222',
      passwordHash: 'hash',
      roles: ['CLIENT'],
      status: 'PENDING',
      nextStage: 'PERSONAL_INFO',
      emailVerified: true,
      phoneVerified: false,
      countryCode: null,
      city: 'Madrid',
      area: null,
      coverageRadiusKm: null,
      workerCategories: null,
      workerHeadline: null,
      workerBio: null,
      preferredPaymentMethod: null,
      documentType: null,
      documentNumber: null,
      birthDate: null,
      gender: null,
      nationality: null,
      ...overrides,
    };
  }

  it('throws 401 when flow is missing', async () => {
    const flowStore = { getFlow: jest.fn().mockResolvedValue(null) } as any;
    const dataSource = { transaction: jest.fn() } as any;
    const uc = new CompleteRegistrationUseCase(flowStore, dataSource, correlationIdService, configService);

    await expect(uc.execute({ flowId: 'missing' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('creates the final user and closes the flow when draft is complete', async () => {
    const flowStore = {
      getFlow: jest.fn().mockResolvedValue({
        flowId: 'flow-1',
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+34600111222',
        passwordHash: 'hash',
        roles: ['WORKER'],
        status: 'PENDING',
        nextStage: 'PERSONAL_INFO',
        emailVerified: true,
        phoneVerified: true,
        city: 'Madrid',
        workerCategories: ['limpieza'],
        documentType: 'DNI',
        documentNumber: '12345678A',
        birthDate: '1990-01-01',
      }),
    } as any;

    const flowEntity = buildFlowEntity({
      roles: ['WORKER'],
      phoneVerified: true,
      workerCategories: ['limpieza'],
      documentType: 'DNI',
      documentNumber: '12345678A',
      birthDate: '1990-01-01',
    });
    const flowRepo = {
      findOne: jest.fn().mockResolvedValue(flowEntity),
      save: jest.fn().mockImplementation(async (entity: RegistrationFlowEntity) => entity),
    };
    const userRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((input: Partial<UserEntity>) => input),
      save: jest.fn().mockResolvedValue({ id: 'user-1' }),
    };
    const manager = {
      getRepository: jest.fn().mockImplementation((entity: unknown) => {
        if (entity === RegistrationFlowEntity) return flowRepo;
        if (entity === UserEntity) return userRepo;
        throw new Error('Unexpected repository');
      }),
    };
    const dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (mgr: typeof manager) => unknown) => cb(manager)),
    } as any;
    const uc = new CompleteRegistrationUseCase(flowStore, dataSource, correlationIdService, configService);

    await uc.execute({ flowId: 'flow-1' });

    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Test User',
        email: 'test@example.com',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
      }),
    );
    expect(flowRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        flowId: 'flow-1',
        userId: 'user-1',
        status: 'ACTIVE',
        nextStage: 'DONE',
      }),
    );
  });

  it('rejects completion when another user already uses the email', async () => {
    const flowStore = {
      getFlow: jest.fn().mockResolvedValue({
        flowId: 'flow-1',
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+34600111222',
        passwordHash: 'hash',
        roles: ['CLIENT'],
        status: 'PENDING',
        nextStage: 'PERSONAL_INFO',
        emailVerified: true,
        phoneVerified: false,
        city: 'Madrid',
      }),
    } as any;
    const flowRepo = {
      findOne: jest.fn().mockResolvedValue(buildFlowEntity()),
      save: jest.fn(),
    };
    const userRepo = {
      findOne: jest.fn().mockResolvedValueOnce({ id: 'existing-user' }),
      create: jest.fn(),
      save: jest.fn(),
    };
    const manager = {
      getRepository: jest.fn().mockImplementation((entity: unknown) => {
        if (entity === RegistrationFlowEntity) return flowRepo;
        if (entity === UserEntity) return userRepo;
        throw new Error('Unexpected repository');
      }),
    };
    const dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (mgr: typeof manager) => unknown) => cb(manager)),
    } as any;
    const uc = new CompleteRegistrationUseCase(flowStore, dataSource, correlationIdService, configService);

    await expect(uc.execute({ flowId: 'flow-1' })).rejects.toBeInstanceOf(AppException);
  });

  it('rejects completion when another user already uses the phone', async () => {
    const flowStore = {
      getFlow: jest.fn().mockResolvedValue({
        flowId: 'flow-1',
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+34600111222',
        passwordHash: 'hash',
        roles: ['CLIENT'],
        status: 'PENDING',
        nextStage: 'PERSONAL_INFO',
        emailVerified: true,
        phoneVerified: false,
        city: 'Madrid',
      }),
    } as any;
    const flowRepo = {
      findOne: jest.fn().mockResolvedValue(buildFlowEntity()),
      save: jest.fn(),
    };
    const userRepo = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'existing-user' }),
      create: jest.fn(),
      save: jest.fn(),
    };
    const manager = {
      getRepository: jest.fn().mockImplementation((entity: unknown) => {
        if (entity === RegistrationFlowEntity) return flowRepo;
        if (entity === UserEntity) return userRepo;
        throw new Error('Unexpected repository');
      }),
    };
    const dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (mgr: typeof manager) => unknown) => cb(manager)),
    } as any;
    const uc = new CompleteRegistrationUseCase(flowStore, dataSource, correlationIdService, configService);

    await expect(uc.execute({ flowId: 'flow-1' })).rejects.toBeInstanceOf(AppException);
  });
});
