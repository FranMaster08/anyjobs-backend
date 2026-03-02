import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { normalizePageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import { OPEN_REQUESTS_REPOSITORY } from '../ports';
import type { OpenRequestsRepositoryPort } from '../ports';
import type { OpenRequestListItem } from '../../domain';

export interface ListOpenRequestsInput {
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface ListOpenRequestsResult extends PageResult<OpenRequestListItem> {
  nextPage: number | null;
  hasMore: boolean;
}

@Injectable()
export class ListOpenRequestsUseCase {
  constructor(
    @Inject(OPEN_REQUESTS_REPOSITORY) private readonly repo: OpenRequestsRepositoryPort,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: ListOpenRequestsInput): Promise<ListOpenRequestsResult> {
    const limits = this.configService.getOrThrow<{ defaultPageSize: number; maxPageSize: number }>('pagination');
    const pageRequest = normalizePageRequest(
      { page: input.page, pageSize: input.pageSize, sortBy: 'publishedAt', sortDirection: 'desc' },
      limits,
    );
    const result = await this.repo.list(pageRequest);
    return {
      ...result,
      nextPage: result.meta.nextPage,
      hasMore: result.meta.hasNextPage,
    };
  }
}

