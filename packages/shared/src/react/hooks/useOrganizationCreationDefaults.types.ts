import type { ClerkAPIResponseError } from '../../errors/clerkApiResponseError';
import type { OrganizationCreationDefaultsResource } from '../../types';

/**
 * @interface
 */
export type UseOrganizationCreationDefaultsParams = {
  /**
   * If true, the previous data will be kept in the cache until new data is fetched.
   *
   * @default true
   */
  keepPreviousData?: boolean;
  /**
   * If `true`, a request will be triggered when the hook is mounted.
   *
   * @default true
   */
  enabled?: boolean;
};

/**
 * @interface
 */
export type UseOrganizationCreationDefaultsReturn = {
  /**
   * The organization creation defaults resource, `undefined` before the first fetch, or `null` if not available.
   */
  data: OrganizationCreationDefaultsResource | undefined | null;
  /**
   * Any error that occurred during the data fetch, or `null` if no error occurred.
   */
  error: ClerkAPIResponseError | null;
  /**
   * A boolean that indicates whether the initial data is still being fetched.
   */
  isLoading: boolean;
  /**
   * A boolean that indicates whether any request is still in flight, including background updates.
   */
  isFetching: boolean;
};
