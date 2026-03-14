import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildPageMeta } from '../../../../shared/application/pagination/page-result';
import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { NewProposal, Proposal } from '../../domain';
import type { ListProposalsFilters, ProposalsRepositoryPort } from '../../application/ports/proposals-repository.port';
import { ProposalEntity } from '../entities/proposal.entity';

function toDomain(e: ProposalEntity): Proposal {
  return {
    id: e.id,
    requestId: e.requestId,
    userId: e.userId,
    author: {
      name: e.authorName,
      subtitle: e.authorSubtitle,
      rating: e.authorRating ?? undefined,
      reviewsCount: e.authorReviewsCount ?? undefined,
    },
    whoAmI: e.whoAmI,
    message: e.message,
    estimate: e.estimate,
    createdAt: e.createdAt.toISOString(),
    status: e.status as any,
  };
}

@Injectable()
export class TypeOrmProposalsRepository implements ProposalsRepositoryPort {
  constructor(@InjectRepository(ProposalEntity) private readonly repo: Repository<ProposalEntity>) {}

  async list(filters: ListProposalsFilters, pageRequest: PageRequest): Promise<PageResult<Proposal>> {
    const qb = this.repo.createQueryBuilder('p');

    if (filters.userId) qb.andWhere('p.userId = :userId', { userId: filters.userId });
    if (filters.requestId) qb.andWhere('p.requestId = :requestId', { requestId: filters.requestId });

    qb.orderBy('p.createdAt', 'DESC').addOrderBy('p.id', 'ASC');

    const totalItems = await qb.getCount();
    const meta = buildPageMeta(totalItems, pageRequest.page, pageRequest.pageSize);
    const items = await qb
      .skip((meta.page - 1) * meta.pageSize)
      .take(meta.pageSize)
      .getMany();

    return { items: items.map(toDomain), meta };
  }

  async create(input: NewProposal): Promise<Proposal> {
    const entity = this.repo.create({
      requestId: input.requestId,
      userId: input.userId,
      authorName: input.author.name,
      authorSubtitle: input.author.subtitle,
      authorRating: input.author.rating ?? null,
      authorReviewsCount: input.author.reviewsCount ?? null,
      whoAmI: input.whoAmI,
      message: input.message,
      estimate: input.estimate,
      status: input.status,
    });
    const saved = await this.repo.save(entity);
    return toDomain(saved);
  }
}

