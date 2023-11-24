/**
 * Pagination params in request
 */
export interface ClerkPaginationRequest {
  limit?: number;
  offset?: number;
}

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
export type ClerkPaginationParams<T = any> = {
  /**
   * This is the starting point for your fetched results. The initial value persists between re-renders
   */
  initialPage?: number;
  /**
   * Maximum number of items returned per request. The initial value persists between re-renders
   */
  pageSize?: number;
} & T;
