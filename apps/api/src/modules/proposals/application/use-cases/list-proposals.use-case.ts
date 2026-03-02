import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { normalizePageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import { PROPOSALS_REPOSITORY } from '../ports';
import type { ListProposalsFilters, ProposalsRepositoryPort } from '../ports';
import type { Proposal } from '../../domain';

export interface ListProposalsInput extends ListProposalsFilters {
  page?: number;
  pageSize?: number;
}

@Injectable()
export class ListProposalsUseCase {
  constructor(
    @Inject(PROPOSALS_REPOSITORY) private readonly repo: ProposalsRepositoryPort,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: ListProposalsInput): Promise<PageResult<Proposal>> {
    const limits = this.configService.getOrThrow<{ defaultPageSize: number; maxPageSize: number }>('pagination');
    const pageRequest = normalizePageRequest({ page: input.page, pageSize: input.pageSize }, limits);
    const { userId, requestId } = input;
    return this.repo.list({ userId, requestId }, pageRequest);
  }
}

