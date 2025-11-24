import type { ClerkPaginationParams } from '@clerk/shared/types';
import { getNonUndefinedValues } from '@clerk/shared/underscore';

export function convertPageToOffsetSearchParams<T>(pageParams: ClerkPaginationParams<T> | undefined) {
  const { pageSize, initialPage, ...restParams } = pageParams || ({} as ClerkPaginationParams);
  const _pageSize = pageSize ?? 10;
  const _initialPage = initialPage ?? 1;

  const obj = {
    ...getNonUndefinedValues(restParams),
    limit: _pageSize + '',
    offset: (_initialPage - 1) * _pageSize + '',
  };

  return new URLSearchParams(obj);
}
