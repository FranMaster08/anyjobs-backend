import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CorrelationIdService } from '../../../../shared/correlation/correlation-id.service';
import { AppException } from '../../../../shared/errors/app-exception';
import { createAppLogger } from '../../../../shared/logging/app-logger';
import { AUTH_REGISTRATION_FLOW_STORE } from '../ports';
import type { RegistrationFlowState, RegistrationFlowStorePort } from '../ports';
import { RegistrationFlowEntity } from '../../infrastructure/entities/registration-flow.entity';
import { UserEntity } from '../../../../shared/persistence/entities';

export interface CompleteRegistrationInput {
  flowId: string;
}

@Injectable()
export class CompleteRegistrationUseCase {
  private readonly logger;

  constructor(
    @Inject(AUTH_REGISTRATION_FLOW_STORE) private readonly flowStore: RegistrationFlowStorePort,
    @InjectDataSource() private readonly dataSource: DataSource,
    correlationIdService: CorrelationIdService,
    configService: ConfigService,
  ) {
    const debugPayloads = configService.get<boolean>('logging.debugPayloads') ?? false;
    this.logger = createAppLogger(CompleteRegistrationUseCase.name, correlationIdService, debugPayloads);
  }

  async execute(input: CompleteRegistrationInput): Promise<void> {
    const preloadedFlow = await this.flowStore.getFlow(input.flowId);
    if (!preloadedFlow || preloadedFlow.completedAt) throw new UnauthorizedException();

    const result = await this.dataSource.transaction(async (manager) => {
      const flowRepo = manager.getRepository(RegistrationFlowEntity);
      const userRepo = manager.getRepository(UserEntity);

      const flow = await flowRepo.findOne({ where: { flowId: input.flowId } });
      if (!flow || flow.completedAt) throw new UnauthorizedException();

      const flowState = this.toFlowState(flow);
      this.assertFlowReady(flowState);

      const existingEmail = await userRepo.findOne({ where: { email: flow.email } });
      if (existingEmail) {
        throw new AppException('USER.EMAIL_ALREADY_EXISTS');
      }

      const existingPhone = await userRepo.findOne({ where: { phoneNumber: flow.phoneNumber } });
      if (existingPhone) {
        throw new AppException('USER.PHONE_ALREADY_EXISTS');
      }

      const created = await userRepo.save(
        userRepo.create({
          fullName: flow.fullName,
          email: flow.email,
          phoneNumber: flow.phoneNumber,
          passwordHash: flow.passwordHash,
          roles: flow.roles as any,
          status: 'ACTIVE',
          emailVerified: flow.emailVerified,
          phoneVerified: flow.phoneVerified,
          countryCode: flow.countryCode ?? null,
          city: flow.city ?? null,
          area: flow.area ?? null,
          coverageRadiusKm: flow.coverageRadiusKm ?? null,
          workerCategories: flow.workerCategories ?? null,
          workerHeadline: flow.workerHeadline ?? null,
          workerBio: flow.workerBio ?? null,
          preferredPaymentMethod: flow.preferredPaymentMethod ?? null,
          documentType: flow.documentType ?? null,
          documentNumber: flow.documentNumber ?? null,
          birthDate: flow.birthDate ?? null,
          gender: flow.gender ?? null,
          nationality: flow.nationality ?? null,
        }),
      );

      flow.userId = created.id;
      flow.status = 'ACTIVE';
      flow.nextStage = 'DONE';
      flow.completedAt = new Date();
      await flowRepo.save(flow);

      return { flowId: flow.flowId, userId: created.id };
    });

    this.logger.debug('Done', result);
  }

  private assertFlowReady(flow: RegistrationFlowState): void {
    const fieldErrors: Record<string, string> = {};
    const isWorker = flow.roles.includes('WORKER');
    const isClientOnly = flow.roles.includes('CLIENT') && !isWorker;

    if (!flow.emailVerified) {
      fieldErrors.emailVerification = 'Email verification is required.';
    }

    if (isWorker && !flow.phoneVerified) {
      fieldErrors.phoneVerification = 'Phone verification is required for WORKER.';
    }

    if (isClientOnly && !(flow.emailVerified || flow.phoneVerified)) {
      fieldErrors.contactVerification = 'At least one verification is required for CLIENT.';
    }

    if (!flow.city) {
      fieldErrors.location = 'Location is required.';
    }

    if (isWorker && (!flow.workerCategories || flow.workerCategories.length < 1)) {
      fieldErrors.workerCategories = 'At least one category is required for WORKER.';
    }

    if (isWorker && (!flow.documentType || !flow.documentNumber || !flow.birthDate)) {
      fieldErrors.personalInfo = 'documentType, documentNumber and birthDate are required for WORKER.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new AppException('VALIDATION.INVALID_INPUT', undefined, { fieldErrors });
    }
  }

  private toFlowState(flow: RegistrationFlowEntity): RegistrationFlowState {
    return {
      flowId: flow.flowId,
      userId: flow.userId ?? undefined,
      createdAt: flow.createdAt.toISOString(),
      updatedAt: flow.updatedAt.toISOString(),
      expiresAt: flow.expiresAt?.toISOString(),
      completedAt: flow.completedAt?.toISOString(),
      fullName: flow.fullName,
      email: flow.email,
      phoneNumber: flow.phoneNumber,
      passwordHash: flow.passwordHash,
      roles: (flow.roles ?? []) as RegistrationFlowState['roles'],
      status: flow.status as RegistrationFlowState['status'],
      nextStage: flow.nextStage as RegistrationFlowState['nextStage'],
      emailVerified: flow.emailVerified,
      phoneVerified: flow.phoneVerified,
      countryCode: flow.countryCode ?? undefined,
      city: flow.city ?? undefined,
      area: flow.area ?? undefined,
      coverageRadiusKm: flow.coverageRadiusKm ?? undefined,
      workerCategories: flow.workerCategories ?? undefined,
      workerHeadline: flow.workerHeadline ?? undefined,
      workerBio: flow.workerBio ?? undefined,
      preferredPaymentMethod: (flow.preferredPaymentMethod ?? undefined) as RegistrationFlowState['preferredPaymentMethod'],
      documentType: (flow.documentType ?? undefined) as RegistrationFlowState['documentType'],
      documentNumber: flow.documentNumber ?? undefined,
      birthDate: flow.birthDate ?? undefined,
      gender: (flow.gender ?? undefined) as RegistrationFlowState['gender'],
      nationality: flow.nationality ?? undefined,
    };
  }
}
