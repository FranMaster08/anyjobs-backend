import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../../shared/persistence/entities';
import type { AuthUser } from '../../domain';
import type { UserRepositoryPort } from '../../application/ports/user-repository.port';

function toAuthUser(e: UserEntity): AuthUser {
  return {
    id: e.id,
    fullName: e.fullName,
    email: e.email,
    phoneNumber: e.phoneNumber,
    passwordHash: e.passwordHash,
    roles: e.roles as any,
    status: e.status as any,
    emailVerified: e.emailVerified,
    phoneVerified: e.phoneVerified,
    createdAt: e.createdAt.toISOString(),
    countryCode: e.countryCode ?? undefined,
    city: e.city ?? undefined,
    area: e.area ?? undefined,
    coverageRadiusKm: e.coverageRadiusKm ?? undefined,
    workerCategories: e.workerCategories ?? undefined,
    workerHeadline: e.workerHeadline ?? undefined,
    workerBio: e.workerBio ?? undefined,
    preferredPaymentMethod: (e.preferredPaymentMethod ?? undefined) as any,
    documentType: (e.documentType ?? undefined) as any,
    documentNumber: e.documentNumber ?? undefined,
    birthDate: e.birthDate ?? undefined,
    gender: (e.gender ?? undefined) as any,
    nationality: e.nationality ?? undefined,
  };
}

@Injectable()
export class TypeOrmAuthUserRepository implements UserRepositoryPort {
  constructor(@InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>) {}

  async create(
    user: Omit<AuthUser, 'id' | 'createdAt'> & Partial<Pick<AuthUser, 'createdAt'>>,
  ): Promise<AuthUser> {
    const entity = this.repo.create({
      id: undefined as any,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      passwordHash: user.passwordHash,
      roles: user.roles as any,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      countryCode: user.countryCode ?? null,
      city: user.city ?? null,
      area: user.area ?? null,
      coverageRadiusKm: user.coverageRadiusKm ?? null,
      workerCategories: user.workerCategories ?? null,
      workerHeadline: user.workerHeadline ?? null,
      workerBio: user.workerBio ?? null,
      preferredPaymentMethod: (user.preferredPaymentMethod as any) ?? null,
      documentType: (user.documentType as any) ?? null,
      documentNumber: user.documentNumber ?? null,
      birthDate: user.birthDate ?? null,
      gender: (user.gender as any) ?? null,
      nationality: user.nationality ?? null,
    });

    const saved = await this.repo.save(entity);
    return toAuthUser(saved);
  }

  async findById(id: string): Promise<AuthUser | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? toAuthUser(e) : null;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const e = await this.repo.findOne({ where: { email } });
    return e ? toAuthUser(e) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<AuthUser | null> {
    const e = await this.repo.findOne({ where: { phoneNumber } });
    return e ? toAuthUser(e) : null;
  }

  async update(id: string, patch: Partial<AuthUser>): Promise<AuthUser> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new Error(`User not found: ${id}`);
    const updated = this.repo.merge(existing, {
      fullName: patch.fullName ?? existing.fullName,
      email: patch.email ?? existing.email,
      phoneNumber: patch.phoneNumber ?? existing.phoneNumber,
      passwordHash: patch.passwordHash ?? existing.passwordHash,
      roles: (patch.roles as any) ?? existing.roles,
      status: (patch.status as any) ?? existing.status,
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
    return toAuthUser(saved);
  }
}

