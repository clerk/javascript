import type { BillingSubscriptionResource, ForPayerType } from '../../types';

export type UseSubscriptionParams = {
  for?: ForPayerType;
  /**
   * If true, the previous data will be kept in the cache until new data is fetched.
   * Defaults to false.
   */
  keepPreviousData?: boolean;
  /**
   * If `true`, a request will be triggered when the hook is mounted.
   *
   * @default true
   */
  enabled?: boolean;
};

export type SubscriptionResult = {
  data: BillingSubscriptionResource | undefined | null;
  error: Error | undefined;
  isLoading: boolean;
  isFetching: boolean;
  /**
   * Revalidate or refetch the subscription data.
   */
  revalidate: () => Promise<void> | void;
};
