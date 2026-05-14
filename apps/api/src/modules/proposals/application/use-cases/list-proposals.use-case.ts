import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { normalizePageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import { AppException } from '../../../../shared/errors/app-exception';
import { OPEN_REQUESTS_REPOSITORY } from '../../../open-requests/application/ports/tokens';
import type { OpenRequestsRepositoryPort } from '../../../open-requests/application/ports/open-requests-repository.port';
import { PROPOSALS_REPOSITORY } from '../ports';
import type { ListProposalsFilters, ProposalsRepositoryPort } from '../ports';
import type { Proposal } from '../../domain';

export interface ListProposalsInput extends ListProposalsFilters {
  page?: number;
  pageSize?: number;
  /** Usuario autenticado; obligatorio si se filtra por `requestId` (solo el dueño puede listar). */
  viewerUserId?: string;
}

@Injectable()
export class ListProposalsUseCase {
  constructor(
    @Inject(PROPOSALS_REPOSITORY) private readonly repo: ProposalsRepositoryPort,
    @Inject(OPEN_REQUESTS_REPOSITORY) private readonly openRequestsRepo: OpenRequestsRepositoryPort,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: ListProposalsInput): Promise<PageResult<Proposal>> {
    const limits = this.configService.getOrThrow<{ defaultPageSize: number; maxPageSize: number }>('pagination');
    const pageRequest = normalizePageRequest({ page: input.page, pageSize: input.pageSize }, limits);
    const { userId, requestId } = input;

    if (requestId) {
      const viewer = input.viewerUserId?.trim() ?? '';
      if (!viewer) throw new AppException('AUTH.UNAUTHORIZED');

      const ownerRow = await this.openRequestsRepo.findOwnerId(requestId);
      if (!ownerRow) throw new AppException('OPEN_REQUEST.NOT_FOUND');
      const ownerUserId = ownerRow.ownerUserId;
      if (!ownerUserId || ownerUserId !== viewer) {
        throw new AppException('PROPOSAL.VIEW_APPLICANTS_FORBIDDEN');
      }
    }

    return this.repo.list({ userId, requestId }, pageRequest);
  }
}
