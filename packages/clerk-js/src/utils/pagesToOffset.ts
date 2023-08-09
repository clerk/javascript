import type { ClerkPaginationParams } from '@clerk/types';

type Pages = {
  initialPage?: number;
  pageSize?: number;
};

export function convertPageToOffset<T extends Pages | undefined>(pageParams: T): ClerkPaginationParams {
  const { pageSize, initialPage, ...restParams } = pageParams || {};
  const _pageSize = pageSize ?? 10;
  const _initialPage = initialPage ?? 1;

  return {
    ...restParams,
    limit: _pageSize,
    offset: (_initialPage - 1) * _pageSize,
  };
}
