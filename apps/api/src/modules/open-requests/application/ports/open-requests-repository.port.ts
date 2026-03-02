import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { OpenRequestDetail, OpenRequestListItem } from '../../domain/open-request';

export interface OpenRequestsRepositoryPort {
  list(pageRequest: PageRequest): Promise<PageResult<OpenRequestListItem>>;
  getById(id: string): Promise<OpenRequestDetail | null>;
}

