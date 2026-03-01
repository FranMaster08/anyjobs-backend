export interface PageMeta {
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface PageResult<T> {
  items: T[];
  meta: PageMeta;
}

export function buildPageMeta(totalItems: number, page: number, pageSize: number): PageMeta {
  const safeTotalItems = Number.isFinite(totalItems) ? Math.max(0, Math.trunc(totalItems)) : 0;
  const safePageSize = Math.max(1, Math.trunc(pageSize));
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / safePageSize));
  const safePage = Math.min(Math.max(1, Math.trunc(page)), totalPages);

  const hasPreviousPage = safePage > 1;
  const hasNextPage = safePage < totalPages;

  return {
    totalItems: safeTotalItems,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage: hasNextPage ? safePage + 1 : null,
    previousPage: hasPreviousPage ? safePage - 1 : null,
  };
}

