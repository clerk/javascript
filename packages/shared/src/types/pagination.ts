/**
 * Pagination params in request
 *
 * @interface
 * @expandProperties
 */
export type ClerkPaginationRequest<T = object> = {
  /**
   * Maximum number of items returned per request. Must be an integer greater than zero and less than `501`. Can be used for paginating the results together with offset. Defaults to `10`.
   */
  limit?: number;
  /**
   * Skip the first `offset` items when paginating. Needs to be an integer greater or equal to zero. To be used in conjunction with `limit`. Defaults to `0`.
   */
  offset?: number;
} & T;

/**
 * An interface that describes the response of a method that returns a paginated list of resources.
 *
 * > [!TIP]
 * > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
 */
export interface ClerkPaginatedResponse<T> {
  /**
   * An array that contains the fetched data.
   */
  data: T[];
  /**
   * The total count of data that exist remotely.
   */
  total_count: number;
}

/**
 * @interface
 * @expandProperties
 */
export type ClerkPaginationParams<T = object> = {
  /**
   * A number that specifies which page to fetch. For example, if `initialPage` is set to `10`, it will skip the first 9 pages and fetch the 10th page.
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
} & T;
