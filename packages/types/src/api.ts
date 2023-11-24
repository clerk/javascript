/**
 * Generic Clerk API error structure.
 */
export interface ClerkAPIError {
  code: string;
  message: string;
  longMessage?: string;
  meta?: {
    paramName?: string;
    sessionId?: string;
    emailAddresses?: string[];
    identifiers?: string[];
    zxcvbn?: {
      suggestions: {
        code: string;
        message: string;
      }[];
    };
  };
}

export interface ClerkRuntimeError {
  code: string;
  message: string;
}

/**
 * Pagination params
 */
export interface ClerkPaginationRequest {
  limit?: number;
  offset?: number;
}

/**
 * Pagination params
 */
export interface ClerkPaginatedResponse<T> {
  data: T[];
  total_count: number;
}
