import type { ClerkAPIError } from '@clerk/types';

export type ClerkBackendApiResponse<T> =
  | {
      data: T;
      errors: null;
      totalCount?: number;
    }
  | {
      data: null;
      errors: ClerkAPIError[];
      totalCount?: never;
      clerkTraceId?: string;
      status?: number;
      statusText?: string;
      retryAfter?: number;
    };
