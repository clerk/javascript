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
  };
}
