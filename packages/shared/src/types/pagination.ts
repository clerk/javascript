/**
 * Pagination params in request
 *
 * @interface
 */
export type ClerkPaginationRequest<T = object> = {
  /**
   * Maximum number of items returned per request.
   */
  limit?: number;
  /**
   * This is the starting point for your fetched results.
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
