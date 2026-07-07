import type { ClerkAPIResponseError } from '../../errors/clerkApiResponseError';
import type { BillingPlanResource } from '../../types';

/** @internal */
export type UsePlanDetailsQueryParams = {
  /** The plan ID to fetch. */
  planId?: string | null;
  /** Initial plan data to use before fetching. */
  initialPlan?: BillingPlanResource | null;
  /** Whether the previous data will be kept in the cache until new data is fetched. Defaults to `true`. */
  keepPreviousData?: boolean;
  /** Whether a request will be triggered when the hook is mounted. Defaults to `true`. */
  enabled?: boolean;
};

/** @internal */
export type PlanDetailsQueryResult = {
  /** The plan object, `undefined` before the first fetch, or `null` if no plan exists. */
  data: BillingPlanResource | undefined | null;
  /** Any error that occurred during the data fetch, or `undefined` if no error occurred. */
  error: ClerkAPIResponseError | null;
  /** Whether the initial data is still being fetched. */
  isLoading: boolean;
  /** Whether any request is still in flight, including background updates. */
  isFetching: boolean;
};
