import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { normalizePageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import { OPEN_REQUESTS_REPOSITORY } from '../ports';
import type { OpenRequestsRepositoryPort } from '../ports';
import type { OpenRequestListItem } from '../../domain';

export interface ListMyOpenRequestsInput {
  ownerUserId: string;
  page?: number;
  pageSize?: number;
}

export interface ListMyOpenRequestsResult extends PageResult<OpenRequestListItem> {
  nextPage: number | null;
  hasMore: boolean;
}

@Injectable()
export class ListMyOpenRequestsUseCase {
  constructor(
    @Inject(OPEN_REQUESTS_REPOSITORY) private readonly repo: OpenRequestsRepositoryPort,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: ListMyOpenRequestsInput): Promise<ListMyOpenRequestsResult> {
    const limits = this.configService.getOrThrow<{ defaultPageSize: number; maxPageSize: number }>('pagination');
    const pageRequest = normalizePageRequest(
      { page: input.page, pageSize: input.pageSize, sortBy: 'publishedAt', sortDirection: 'desc' },
      limits,
    );
    const result = await this.repo.listByOwner(input.ownerUserId, pageRequest);
    return {
      ...result,
      nextPage: result.meta.nextPage,
      hasMore: result.meta.hasNextPage,
    };
  }
}
