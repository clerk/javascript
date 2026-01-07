import type { ClerkAPIError, ClerkError } from '@clerk/shared/error';
import { createClerkGlobalHookError, isClerkAPIResponseError } from '@clerk/shared/error';
import { signInSchema, signUpSchema, waitlistSchema } from '@clerk/shared/resourceSchemas';
import type { Errors, SignInSignal, SignUpSignal, WaitlistSignal } from '@clerk/shared/types';
import { snakeToCamel } from '@clerk/shared/underscore';


import type { SignIn } from './resources/SignIn';
import type { SignUp } from './resources/SignUp';
import type { Waitlist } from './resources/Waitlist';
import { createResourceSignals } from './signalFactory';

// SignIn signals using factory with schema
const signInSignals = createResourceSignals<SignIn, Record<string, unknown>>({
  name: signInSchema.name,
  errorFields: signInSchema.errorFields as unknown as Record<string, unknown>,
  getPublicResource: (resource: unknown) => (resource as SignIn).__internal_future,
});

export const signInResourceSignal = signInSignals.resourceSignal;
export const signInErrorSignal = signInSignals.errorSignal;
export const signInFetchSignal = signInSignals.fetchSignal;
export const signInComputedSignal = signInSignals.computedSignal as unknown as SignInSignal;

// SignUp signals using factory with schema
const signUpSignals = createResourceSignals<SignUp, Record<string, unknown>>({
  name: signUpSchema.name,
  errorFields: signUpSchema.errorFields as unknown as Record<string, unknown>,
  getPublicResource: (resource: unknown) => (resource as SignUp).__internal_future,
});

export const signUpResourceSignal = signUpSignals.resourceSignal;
export const signUpErrorSignal = signUpSignals.errorSignal;
export const signUpFetchSignal = signUpSignals.fetchSignal;
export const signUpComputedSignal = signUpSignals.computedSignal as unknown as SignUpSignal;

// Waitlist signals using factory with schema
const waitlistSignals = createResourceSignals<Waitlist, Record<string, unknown>>({
  name: waitlistSchema.name,
  errorFields: waitlistSchema.errorFields as unknown as Record<string, unknown>,
  // Waitlist is a singleton, no transformation needed
});

export const waitlistResourceSignal = waitlistSignals.resourceSignal;
export const waitlistErrorSignal = waitlistSignals.errorSignal;
export const waitlistFetchSignal = waitlistSignals.fetchSignal;
export const waitlistComputedSignal = waitlistSignals.computedSignal as unknown as WaitlistSignal;

/**
 * Converts an error to a parsed errors object that reports the specific fields that the error pertains to. Will put
 * generic non-API errors into the global array.
 */
export function errorsToParsedErrors<T extends Record<string, unknown>>(
  error: ClerkError | null,
  initialFields: T,
): Errors<T> {
  const parsedErrors: Errors<T> = {
    fields: { ...initialFields },
    raw: null,
    global: null,
  };

  if (!error) {
    return parsedErrors;
  }

  if (!isClerkAPIResponseError(error)) {
    parsedErrors.raw = [error];
    parsedErrors.global = [createClerkGlobalHookError(error)];
    return parsedErrors;
  }

  function isFieldError(error: ClerkAPIError): boolean {
    return 'meta' in error && error.meta && 'paramName' in error.meta && error.meta.paramName !== undefined;
  }
  const hasFieldErrors = error.errors.some(isFieldError);
  if (hasFieldErrors) {
    error.errors.forEach(error => {
      if (parsedErrors.raw) {
        parsedErrors.raw.push(error);
      } else {
        parsedErrors.raw = [error];
      }
      if (isFieldError(error)) {
        const name = snakeToCamel(error.meta.paramName);
        if (name in parsedErrors.fields) {
          (parsedErrors.fields as any)[name] = error;
        }
      }
      // Note that this assumes a given ClerkAPIResponseError will only have either field errors or global errors, but
      // not both. If a global error is present, it will be discarded.
    });

    return parsedErrors;
  }

  // At this point, we know that `error` is a ClerkAPIResponseError and that it has no field errors.
  parsedErrors.raw = [error];
  parsedErrors.global = [createClerkGlobalHookError(error)];

  return parsedErrors;
}

