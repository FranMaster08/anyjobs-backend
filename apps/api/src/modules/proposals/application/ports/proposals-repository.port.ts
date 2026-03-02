import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { NewProposal, Proposal } from '../../domain';

export interface ListProposalsFilters {
  userId?: string;
  requestId?: string;
}

export interface ProposalsRepositoryPort {
  list(filters: ListProposalsFilters, pageRequest: PageRequest): Promise<PageResult<Proposal>>;
  create(input: NewProposal): Promise<Proposal>;
}

