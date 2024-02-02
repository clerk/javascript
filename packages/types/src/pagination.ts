/**
 * Pagination params in request
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
 * Pagination params in response
 */
export interface ClerkPaginatedResponse<T> {
  data: T[];
  total_count: number;
}

/**
 * Pagination params passed in FAPI client methods
 */
export type ClerkPaginationParams<T = object> = {
  /**
   * This is the starting point for your fetched results.
   */
  initialPage?: number;
  /**
   * Maximum number of items returned per request.
   */
  pageSize?: number;
} & T;
