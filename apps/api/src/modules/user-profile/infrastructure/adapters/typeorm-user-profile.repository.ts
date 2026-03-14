import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../../shared/persistence/entities';
import type { UserProfileUser } from '../../domain';
import type { UserProfileRepositoryPort } from '../../application/ports/user-profile-repository.port';

function toUserProfileUser(e: UserEntity): UserProfileUser {
  return {
    id: e.id,
    roles: e.roles as any,
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
export class TypeOrmUserProfileRepository implements UserProfileRepositoryPort {
  constructor(@InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>) {}

  async findById(id: string): Promise<UserProfileUser | null> {
    const user = await this.repo.findOne({ where: { id } });
    return user ? toUserProfileUser(user) : null;
  }

  async update(id: string, patch: Partial<UserProfileUser>): Promise<void> {
    await this.repo.update(
      { id },
      {
        roles: (patch.roles as any) ?? undefined,
        countryCode: patch.countryCode !== undefined ? (patch.countryCode ?? null) : undefined,
        city: patch.city !== undefined ? (patch.city ?? null) : undefined,
        area: patch.area !== undefined ? (patch.area ?? null) : undefined,
        coverageRadiusKm: patch.coverageRadiusKm !== undefined ? (patch.coverageRadiusKm ?? null) : undefined,
        workerCategories: patch.workerCategories !== undefined ? (patch.workerCategories ?? null) : undefined,
        workerHeadline: patch.workerHeadline !== undefined ? (patch.workerHeadline ?? null) : undefined,
        workerBio: patch.workerBio !== undefined ? (patch.workerBio ?? null) : undefined,
        preferredPaymentMethod:
          patch.preferredPaymentMethod !== undefined ? ((patch.preferredPaymentMethod as any) ?? null) : undefined,
        documentType: patch.documentType !== undefined ? ((patch.documentType as any) ?? null) : undefined,
        documentNumber: patch.documentNumber !== undefined ? (patch.documentNumber ?? null) : undefined,
        birthDate: patch.birthDate !== undefined ? (patch.birthDate ?? null) : undefined,
        gender: patch.gender !== undefined ? ((patch.gender as any) ?? null) : undefined,
        nationality: patch.nationality !== undefined ? (patch.nationality ?? null) : undefined,
      },
    );
  }
}

