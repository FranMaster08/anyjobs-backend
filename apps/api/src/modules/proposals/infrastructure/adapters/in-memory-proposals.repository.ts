import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { buildPageMeta } from '../../../../shared/application/pagination/page-result';
import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { NewProposal, Proposal } from '../../domain';
import type {
  ListProposalsFilters,
  ProposalsRepositoryPort,
} from '../../application/ports/proposals-repository.port';

@Injectable()
export class InMemoryProposalsRepository implements ProposalsRepositoryPort {
  private readonly proposals: Proposal[] = [];

  async list(filters: ListProposalsFilters, pageRequest: PageRequest): Promise<PageResult<Proposal>> {
    const filtered = this.proposals.filter((p) => {
      if (filters.userId && p.userId !== filters.userId) return false;
      if (filters.requestId && p.requestId !== filters.requestId) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
    const totalItems = sorted.length;
    const meta = buildPageMeta(totalItems, pageRequest.page, pageRequest.pageSize);

    const start = (meta.page - 1) * meta.pageSize;
    const end = start + meta.pageSize;
    const items = sorted.slice(start, end);

    return { items, meta };
  }

  async create(
    input: NewProposal,
  ): Promise<Proposal> {
    const proposal: Proposal = {
      id: randomUUID(),
      ...input,
    };
    this.proposals.push(proposal);
    return proposal;
  }
}

