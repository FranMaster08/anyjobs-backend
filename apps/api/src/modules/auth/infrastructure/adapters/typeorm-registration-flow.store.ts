import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { RegistrationFlowState, RegistrationFlowStorePort } from '../../application/ports/registration-flow-store.port';
import { RegistrationFlowEntity } from '../entities/registration-flow.entity';

function toState(flow: RegistrationFlowEntity): RegistrationFlowState {
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
    roles: (flow.roles ?? []) as Array<'CLIENT' | 'WORKER'>,
    status: flow.status as 'PENDING' | 'ACTIVE',
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

@Injectable()
export class TypeOrmRegistrationFlowStore implements RegistrationFlowStorePort {
  constructor(@InjectRepository(RegistrationFlowEntity) private readonly repo: Repository<RegistrationFlowEntity>) {}

  async createFlow(
    input: Omit<RegistrationFlowState, 'flowId' | 'createdAt' | 'updatedAt' | 'completedAt'>,
  ): Promise<RegistrationFlowState> {
    const entity = this.repo.create({
      userId: input.userId ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      fullName: input.fullName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      passwordHash: input.passwordHash,
      roles: input.roles as any,
      status: input.status,
      nextStage: input.nextStage,
      emailVerified: input.emailVerified,
      phoneVerified: input.phoneVerified,
      countryCode: input.countryCode ?? null,
      city: input.city ?? null,
      area: input.area ?? null,
      coverageRadiusKm: input.coverageRadiusKm ?? null,
      workerCategories: input.workerCategories ?? null,
      workerHeadline: input.workerHeadline ?? null,
      workerBio: input.workerBio ?? null,
      preferredPaymentMethod: (input.preferredPaymentMethod as any) ?? null,
      documentType: (input.documentType as any) ?? null,
      documentNumber: input.documentNumber ?? null,
      birthDate: input.birthDate ?? null,
      gender: (input.gender as any) ?? null,
      nationality: input.nationality ?? null,
    });
    const saved = await this.repo.save(entity);
    return toState(saved);
  }

  async getFlow(flowId: string): Promise<RegistrationFlowState | null> {
    const flow = await this.repo.findOne({ where: { flowId } });
    if (!flow) return null;
    return toState(flow);
  }

  async findActiveFlowByEmail(email: string): Promise<RegistrationFlowState | null> {
    const flow = await this.repo.findOne({ where: { email, completedAt: IsNull() } });
    return flow ? toState(flow) : null;
  }

  async findActiveFlowByPhoneNumber(phoneNumber: string): Promise<RegistrationFlowState | null> {
    const flow = await this.repo.findOne({ where: { phoneNumber, completedAt: IsNull() } });
    return flow ? toState(flow) : null;
  }

  async updateFlow(
    flowId: string,
    patch: Partial<Omit<RegistrationFlowState, 'flowId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<RegistrationFlowState | null> {
    const existing = await this.repo.findOne({ where: { flowId } });
    if (!existing) return null;

    const updated = this.repo.merge(existing, {
      userId: patch.userId !== undefined ? (patch.userId ?? null) : existing.userId,
      expiresAt: patch.expiresAt !== undefined ? (patch.expiresAt ? new Date(patch.expiresAt) : null) : existing.expiresAt,
      completedAt:
        patch.completedAt !== undefined ? (patch.completedAt ? new Date(patch.completedAt) : null) : existing.completedAt,
      fullName: patch.fullName ?? existing.fullName,
      email: patch.email ?? existing.email,
      phoneNumber: patch.phoneNumber ?? existing.phoneNumber,
      passwordHash: patch.passwordHash ?? existing.passwordHash,
      roles: (patch.roles as any) ?? existing.roles,
      status: (patch.status as any) ?? existing.status,
      nextStage: (patch.nextStage as any) ?? existing.nextStage,
      emailVerified: patch.emailVerified ?? existing.emailVerified,
      phoneVerified: patch.phoneVerified ?? existing.phoneVerified,
      countryCode: patch.countryCode !== undefined ? (patch.countryCode ?? null) : existing.countryCode,
      city: patch.city !== undefined ? (patch.city ?? null) : existing.city,
      area: patch.area !== undefined ? (patch.area ?? null) : existing.area,
      coverageRadiusKm:
        patch.coverageRadiusKm !== undefined ? (patch.coverageRadiusKm ?? null) : existing.coverageRadiusKm,
      workerCategories:
        patch.workerCategories !== undefined ? (patch.workerCategories ?? null) : existing.workerCategories,
      workerHeadline: patch.workerHeadline !== undefined ? (patch.workerHeadline ?? null) : existing.workerHeadline,
      workerBio: patch.workerBio !== undefined ? (patch.workerBio ?? null) : existing.workerBio,
      preferredPaymentMethod:
        patch.preferredPaymentMethod !== undefined
          ? ((patch.preferredPaymentMethod as any) ?? null)
          : existing.preferredPaymentMethod,
      documentType:
        patch.documentType !== undefined ? ((patch.documentType as any) ?? null) : existing.documentType,
      documentNumber: patch.documentNumber !== undefined ? (patch.documentNumber ?? null) : existing.documentNumber,
      birthDate: patch.birthDate !== undefined ? (patch.birthDate ?? null) : existing.birthDate,
      gender: patch.gender !== undefined ? ((patch.gender as any) ?? null) : existing.gender,
      nationality: patch.nationality !== undefined ? (patch.nationality ?? null) : existing.nationality,
    });

    const saved = await this.repo.save(updated);
    return toState(saved);
  }
}

