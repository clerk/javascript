import type { ClerkPaginatedResponse } from '@clerk/types';

export type ValueOrSetter<T = unknown> = (size: T | ((_size: T) => T)) => void;

export type CacheSetter<CData = any> = (
  data?: CData | ((currentData?: CData) => Promise<undefined | CData> | undefined | CData),
) => Promise<CData | undefined>;

export type PaginatedResources<T = unknown, Infinite = false> = {
  data: T[];
  count: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  page: number;
  pageCount: number;
  fetchPage: ValueOrSetter<number>;
  fetchPrevious: () => void;
  fetchNext: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  revalidate: () => Promise<void>;
  setData: Infinite extends true
    ? // Array of pages of data
      CacheSetter<(ClerkPaginatedResponse<T> | undefined)[]>
    : // Array of data
      CacheSetter<ClerkPaginatedResponse<T> | undefined>;
};

// Utility type to convert PaginatedDataAPI to properties as undefined, except booleans set to false
export type PaginatedResourcesWithDefault<T> = {
  [K in keyof PaginatedResources<T>]: PaginatedResources<T>[K] extends boolean ? false : undefined;
};
