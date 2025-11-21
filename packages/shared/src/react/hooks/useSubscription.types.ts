import type { BillingSubscriptionResource, ForPayerType } from '../../types';

/**
 * @interface
 */
export type UseSubscriptionParams = {
  /**
   * Specifies whether to fetch the Subscription for an Organization or a user.
   *
   * @default 'user'
   */
  for?: ForPayerType;
  /**
   * If true, the previous data will be kept in the cache until new data is fetched.
   *
   * @default false
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
export type SubscriptionResult = {
  /**
   * The subscription object, `undefined` before the first fetch, or `null` if no subscription exists.
   */
  data: BillingSubscriptionResource | undefined | null;
  /**
   * Any error that occurred during the data fetch, or `undefined` if no error occurred.
   */
  error: Error | undefined;
  /**
   * A boolean that indicates whether the initial data is still being fetched.
   */
  isLoading: boolean;
  /**
   * A boolean that indicates whether any request is still in flight, including background updates.
   */
  isFetching: boolean;
  /**
   * Function to manually revalidate or refresh the subscription data.
   */
  revalidate: () => Promise<void> | void;
};
