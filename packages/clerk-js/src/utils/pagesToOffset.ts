import type { ClerkPaginationParams } from '@clerk/types';

type Pages = {
  initialPage?: number;
  pageSize?: number;
};
function getNonUndefinedValues<T>(obj: Record<string, T>): Record<string, T> {
  return Object.keys(obj).reduce((result, key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Record<string, T>);
}
export function convertPageToOffset<T extends Pages | undefined>(pageParams: T): ClerkPaginationParams {
  const { pageSize, initialPage, ...restParams } = pageParams || {};
  const _pageSize = pageSize ?? 10;
  const _initialPage = initialPage ?? 1;

  return {
    ...getNonUndefinedValues(restParams),
    limit: _pageSize,
    offset: (_initialPage - 1) * _pageSize,
  };
}
