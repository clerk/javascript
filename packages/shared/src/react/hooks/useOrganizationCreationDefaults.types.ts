import type { ClerkAPIResponseError } from '../../errors/clerkApiResponseError';
import type { OrganizationCreationDefaultsResource } from '../../types';

/**
 * @interface
 * @noHeading
 */
export type UseOrganizationCreationDefaultsParams = {
  /** Whether the previous data will be kept in the cache until new data is fetched. Defaults to `true`. */
  keepPreviousData?: boolean;
  /** Whether a request will be triggered when the hook is mounted. Defaults to `true`. */
  enabled?: boolean;
};

/**
 * @interface
 * @noHeading
 */
export type UseOrganizationCreationDefaultsReturn = {
  /** The organization creation defaults resource, `undefined` before the first fetch, or `null` if not available. */
  data: OrganizationCreationDefaultsResource | undefined | null;
  /** Any error that occurred during the data fetch, or `null` if no error occurred. */
  error: ClerkAPIResponseError | null;
  /** Whether the initial data is still being fetched. */
  isLoading: boolean;
  /** Whether any request is still in flight, including background updates. */
  isFetching: boolean;
};
