import type { KeyedMutator } from './clerk-swr';

export type ValueOrSetter<T = unknown> = (size: T | ((_size: T) => T)) => void;
export type PaginatedResources<T = unknown, Infinite = false, ArrayOrPaginated = unknown> = {
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
  mutate: Infinite extends true
    ? // Array of pages of data
      KeyedMutator<(ArrayOrPaginated | undefined)[]>
    : // Array of data
      KeyedMutator<ArrayOrPaginated | undefined>;
};

// Utility type to convert PaginatedDataAPI to properties as undefined, except booleans set to false
export type PaginatedResourcesWithDefault<T> = {
  [K in keyof PaginatedResources<T>]: PaginatedResources<T>[K] extends boolean ? false : undefined;
};
