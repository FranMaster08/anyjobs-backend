import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../shared/persistence/entities';
import { OpenRequestEntity } from '../../open-requests/infrastructure/entities/open-request.entity';
import { ProposalEntity } from '../../proposals/infrastructure/entities/proposal.entity';
import type { UserPrivateProfileResponseDto, UserPublicProfileResponseDto } from '../api/dtos';

@Injectable()
export class UserProfileReadService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(OpenRequestEntity) private readonly openRequests: Repository<OpenRequestEntity>,
    @InjectRepository(ProposalEntity) private readonly proposals: Repository<ProposalEntity>,
  ) {}

  private async loadMetrics(userId: string): Promise<{ openRequestsPublished: number; proposalsSent: number }> {
    const [openRequestsPublished, proposalsSent] = await Promise.all([
      this.openRequests.count({ where: { ownerUserId: userId } }),
      this.proposals.count({ where: { userId } }),
    ]);
    return { openRequestsPublished, proposalsSent };
  }

  async getPublicProfile(userId: string): Promise<UserPublicProfileResponseDto> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const metrics = await this.loadMetrics(userId);

    return {
      userId: user.id,
      fullName: user.fullName,
      roles: user.roles as Array<'CLIENT' | 'WORKER'>,
      countryCode: user.countryCode ?? undefined,
      city: user.city ?? undefined,
      area: user.area ?? undefined,
      workerHeadline: user.workerHeadline ?? undefined,
      workerBio: user.workerBio ?? undefined,
      workerCategories: user.workerCategories ?? undefined,
      visibility: 'public',
      metrics,
    };
  }

  async getPrivateProfile(userId: string): Promise<UserPrivateProfileResponseDto> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const metrics = await this.loadMetrics(userId);

    return {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles as Array<'CLIENT' | 'WORKER'>,
      status: user.status as 'PENDING' | 'ACTIVE',
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      countryCode: user.countryCode ?? undefined,
      city: user.city ?? undefined,
      area: user.area ?? undefined,
      coverageRadiusKm: user.coverageRadiusKm ?? undefined,
      workerHeadline: user.workerHeadline ?? undefined,
      workerBio: user.workerBio ?? undefined,
      workerCategories: user.workerCategories ?? undefined,
      preferredPaymentMethod: (user.preferredPaymentMethod ?? undefined) as UserPrivateProfileResponseDto['preferredPaymentMethod'],
      documentType: (user.documentType ?? undefined) as UserPrivateProfileResponseDto['documentType'],
      documentNumber: user.documentNumber ?? undefined,
      birthDate: user.birthDate ?? undefined,
      gender: (user.gender ?? undefined) as UserPrivateProfileResponseDto['gender'],
      nationality: user.nationality ?? undefined,
      createdAt: user.createdAt?.toISOString(),
      visibility: 'private',
      metrics,
    };
  }
}
