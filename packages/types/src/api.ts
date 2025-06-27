/**
 * An interface that represents an error returned by the Clerk API.
 */
export interface ClerkAPIError {
  /**
   * A string code that represents the error, such as `username_exists_code`.
   */
  code: string;
  /**
   * A message that describes the error.
   */
  message: string;
  /**
   * A more detailed message that describes the error.
   */
  longMessage?: string;
  /**
   * Additional information about the error.
   */
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
    permissions?: string[];
    plan?: {
      amount_formatted: string;
      annual_monthly_amount_formatted: string;
      currency_symbol: string;
      id: string;
      name: string;
    };
  };
}

export interface ClerkRuntimeError {
  code: string;
  message: string;
}

/**
 * Interface representing a Clerk API Response Error.
 */
export interface ClerkAPIResponseError extends Error {
  clerkError: true;
  status: number;
  message: string;
  clerkTraceId?: string;
  retryAfter?: number;
  errors: ClerkAPIError[];
}
