import { getNonUndefinedValues } from '@clerk/shared';
import type { ClerkPaginationParams, ClerkPaginationRequest } from '@clerk/types';

export function convertPageToOffset<T extends ClerkPaginationParams | undefined>(
  pageParams: T,
): ClerkPaginationRequest {
  const { pageSize, initialPage, ...restParams } = pageParams || ({} as ClerkPaginationParams);
  const _pageSize = pageSize ?? 10;
  const _initialPage = initialPage ?? 1;

  return {
    ...getNonUndefinedValues(restParams),
    limit: _pageSize,
    offset: (_initialPage - 1) * _pageSize,
  };
}
