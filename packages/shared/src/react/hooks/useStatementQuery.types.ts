import type { BillingStatementResource, ClerkAPIResponseError, ForPayerType } from '../../types';

/**
 * @internal
 */
export type UseStatementQueryParams = {
  /**
   * The statement ID to fetch.
   */
  statementId?: string | null;
  /**
   * Specifies whether to fetch the statement for an organization or a user.
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
 * @internal
 */
export type StatementQueryResult = {
  /**
   * The statement object, `undefined` before the first fetch, or `null` if no statement exists.
   */
  data: BillingStatementResource | undefined | null;
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
