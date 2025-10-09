import { isClerkApiResponseError } from './clerkApiError';
import type { ClerkError } from './future';

/**
 * Creates a ClerkGlobalHookError object from a ClerkError instance.
 * It's a wrapper for all the different instances of Clerk errors that can
 * be returned when using Clerk hooks.
 */
export function ClerkGlobalHookError(error: ClerkError) {
  const predicates = {
    isClerkApiResponseError,
  } as const;

  for (const [name, fn] of Object.entries(predicates)) {
    Object.assign(error, { [name]: fn });
  }

  return error as ClerkError & typeof predicates;
}

const ar = ClerkGlobalHookError({} as any);

console.log(ar.retryAfter);
if (ar.isClerkApiResponseError()) {
  console.log(ar.retryAfter);
}
