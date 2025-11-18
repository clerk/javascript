import type { ClerkAPIResponseError } from '../error';
import type { ClerkPaginatedResponse } from '../types';

export type ValueOrSetter<T = unknown> = (size: T | ((_size: T) => T)) => void;

export type CacheSetter<CData = any> = (
  data?: CData | ((currentData?: CData) => Promise<undefined | CData> | undefined | CData),
) => Promise<CData | undefined>;

/**
 * @interface
 */
export type PaginatedResources<T = unknown, Infinite = false> = {
  /**
   * An array that contains the fetched data. For example, for the `memberships` attribute, data will be an array of [`OrganizationMembership`](https://clerk.com/docs/reference/javascript/types/organization-membership) objects.
   */
  data: T[];
  /**
   * The total count of data that exist remotely.
   */
  count: number;
  /**
   * Clerk's API response error object.
   */
  error: ClerkAPIResponseError | null;
  /**
   * A boolean that is `true` if there is an ongoing request and there is no fetched data.
   */
  isLoading: boolean;
  /**
   * A boolean that is `true` if there is an ongoing request or a revalidation.
   */
  isFetching: boolean;
  /**
   * A boolean that indicates the request failed.
   */
  isError: boolean;
  /**
   * The current page.
   */
  page: number;
  /**
   * The total amount of pages. It is calculated based on `count`, `initialPage`, and `pageSize`.
   */
  pageCount: number;
  /**
   * A function that triggers a specific page to be loaded.
   */
  fetchPage: ValueOrSetter<number>;
  /**
   *
   * A function that triggers the previous page to be loaded. This is the same as `fetchPage(page => Math.max(0, page - 1))`.
   */
  fetchPrevious: () => void;
  /**
   * A function that triggers the next page to be loaded. This is the same as `fetchPage(page => Math.min(pageCount, page + 1))`.
   */
  fetchNext: () => void;
  /**
   * A boolean that indicates if there are available pages to be fetched.
   */
  hasNextPage: boolean;
  /**
   * A boolean that indicates if there are available pages to be fetched.
   */
  hasPreviousPage: boolean;
  /**
   * A function that triggers a revalidation of the current page.
   */
  revalidate: () => Promise<void>;
  /**
   * A function that allows you to set the data manually.
   */
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

/**
 * @inline
 */
export type PaginatedHookConfig<T> = T & {
  /**
   * If `true`, newly fetched data will be appended to the existing list rather than replacing it. Useful for implementing infinite scroll functionality.
   *
   * @default false
   */
  infinite?: boolean;
  /**
   * If `true`, the previous data will be kept in the cache until new data is fetched.
   *
   * @default false
   */
  keepPreviousData?: boolean;
};

export type PagesOrInfiniteConfig = PaginatedHookConfig<{
  /**
   * If `true`, a request will be triggered when the hook is mounted.
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * On `cache` mode, no request will be triggered when the hook is mounted and the data will be fetched from the cache.
   *
   * @default undefined
   *
   * @hidden
   *
   * @experimental
   */
  __experimental_mode?: 'cache';

  /**
   * @experimental
   *
   * @hidden
   */
  isSignedIn?: boolean;
}>;

/**
 * @interface
 */
export type PagesOrInfiniteOptions = {
  /**
   * A number that specifies which page to fetch. For example, if `initialPage` is set to 10, it will skip the first 9 pages and fetch the 10th page.
   *
   * @default 1
   */
  initialPage?: number;
  /**
   * A number that specifies the maximum number of results to return per page.
   *
   * @default 10
   */
  pageSize?: number;
};
