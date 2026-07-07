import type { BillingSubscriptionResource, ForPayerType } from '../../types';

/**
 * @interface
 * @noHeading
 */
export type UseSubscriptionParams = {
  /** Specifies whether to fetch the Subscription for an Organization or a user. Defaults to `'user'`. */
  for?: ForPayerType;
  /** Whether the previous data will be kept in the cache until new data is fetched. Defaults to `false`. */
  keepPreviousData?: boolean;
  /** Whether a request will be triggered when the hook is mounted. Defaults to `true`. */
  enabled?: boolean;
};

/**
 * @interface
 * @noHeading
 */
export type SubscriptionResult = {
  /** The subscription object, `undefined` before the first fetch, or `null` if no subscription exists. */
  data: BillingSubscriptionResource | undefined | null;
  /** Any error that occurred during the data fetch, or `undefined` if no error occurred. */
  error: Error | undefined;
  /** Whether the initial data is still being fetched. */
  isLoading: boolean;
  /** Whether any request is still in flight, including background updates. */
  isFetching: boolean;
  /** Function to manually revalidate or refresh the subscription data. */
  revalidate: () => Promise<void> | void;
};
