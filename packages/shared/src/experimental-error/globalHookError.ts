import { isClerkApiResponseError } from './clerkApiError';
import { isClerkRuntimeError } from './clerkRuntimeError';
import type { ClerkError } from './future';

/**
 * Creates a ClerkGlobalHookError object from a ClerkError instance.
 * It's a wrapper for all the different instances of Clerk errors that can
 * be returned when using Clerk hooks.
 */
export function ClerkGlobalHookError(error: ClerkError) {
  const predicates = {
    isClerkApiResponseError,
    isClerkRuntimeError,
  } as const;

  for (const [name, fn] of Object.entries(predicates)) {
    Object.assign(error, { [name]: fn });
  }

  return error as ClerkError & typeof predicates;
}

export type ClerkGlobalHookError = ReturnType<typeof ClerkGlobalHookError>;
