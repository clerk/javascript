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

export type PaginatedHookConfig<T> = T & {
  /**
   * Persists the previous pages with new ones in the same array
   */
  infinite?: boolean;
  /**
   * Return the previous key's data until the new data has been loaded
   */
  keepPreviousData?: boolean;
};

export type PagesOrInfiniteConfig = PaginatedHookConfig<{
  /**
   * Should a request be triggered
   */
  enabled?: boolean;
}>;

export type PagesOrInfiniteOptions = {
  /**
   * This the starting point for your fetched results. The initial value persists between re-renders
   */
  initialPage?: number;
  /**
   * Maximum number of items returned per request. The initial value persists between re-renders
   */
  pageSize?: number;
};
