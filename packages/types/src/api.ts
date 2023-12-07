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
    permissions?: string[];
  };
}

export interface ClerkRuntimeError {
  code: string;
  message: string;
}
