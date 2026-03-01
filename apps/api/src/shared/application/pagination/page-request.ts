export type SortDirection = 'asc' | 'desc';

export const DEFAULT_SORT_BY = 'createdAt';
export const DEFAULT_SORT_DIRECTION: SortDirection = 'desc';

export interface PageRequest {
  page: number; // 1-based
  pageSize: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}

export interface PageRequestLimits {
  defaultPageSize: number;
  maxPageSize: number;
}

export function normalizePageRequest(
  input: Partial<PageRequest> | undefined,
  limits: PageRequestLimits,
): PageRequest {
  const rawPage = input?.page ?? 1;
  const rawPageSize = input?.pageSize ?? limits.defaultPageSize;

  const page = Number.isFinite(rawPage) ? Math.trunc(rawPage) : 1;
  const pageSize = Number.isFinite(rawPageSize) ? Math.trunc(rawPageSize) : limits.defaultPageSize;

  const normalizedPage = page >= 1 ? page : 1;
  const normalizedPageSize = Math.max(1, Math.min(pageSize, limits.maxPageSize));

  return {
    page: normalizedPage,
    pageSize: normalizedPageSize,
    sortBy: input?.sortBy,
    sortDirection: input?.sortDirection,
  };
}

