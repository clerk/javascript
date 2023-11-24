import type { ClerkPaginationParams, ClerkPaginationRequest } from '@clerk/types';

function getNonUndefinedValues<T>(obj: Record<string, T>): Record<string, T> {
  return Object.keys(obj).reduce((result, key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Record<string, T>);
}
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
