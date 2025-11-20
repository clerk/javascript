import type { BillingPaymentResource, ForPayerType } from '../../types';

/**
 * @interface
 */
export type UsePaymentAttemptQueryParams = {
  /**
   * The payment attempt ID to fetch.
   */
  paymentAttemptId: string;
  /**
   * Specifies whether to fetch the payment attempt for an organization or a user.
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
export type PaymentAttemptQueryResult = {
  /**
   * The payment attempt object, `undefined` before the first fetch, or `null` if no payment attempt exists.
   */
  data: BillingPaymentResource | undefined | null;
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
};
