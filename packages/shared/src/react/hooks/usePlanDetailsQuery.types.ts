import type { ClerkAPIResponseError } from '../../errors/clerkApiResponseError';
import type { BillingPlanResource } from '../../types';

/**
 * @interface
 */
export type UsePlanDetailsQueryParams = {
  /**
   * The plan ID to fetch.
   */
  planId?: string | null;
  /**
   * Initial plan data to use before fetching.
   */
  initialPlan?: BillingPlanResource | null;
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
export type PlanDetailsQueryResult = {
  /**
   * The plan object, `undefined` before the first fetch, or `null` if no plan exists.
   */
  data: BillingPlanResource | undefined | null;
  /**
   * Any error that occurred during the data fetch, or `undefined` if no error occurred.
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
