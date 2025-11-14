import { type ClerkError, createClerkGlobalHookError, isClerkAPIResponseError } from '@clerk/shared/error';
import type { Errors, SignInErrors, SignInSignal, SignUpErrors, SignUpSignal } from '@clerk/shared/types';
import { snakeToCamel } from '@clerk/shared/underscore';
import { computed, signal } from 'alien-signals';

import type { SignIn } from './resources/SignIn';
import type { SignUp } from './resources/SignUp';

export const signInResourceSignal = signal<{ resource: SignIn | null }>({ resource: null });
export const signInErrorSignal = signal<{ error: ClerkError | null }>({ error: null });
export const signInFetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });

export const signInComputedSignal: SignInSignal = computed(() => {
  const signIn = signInResourceSignal().resource;
  const error = signInErrorSignal().error;
  const fetchStatus = signInFetchSignal().status;

  const errors = errorsToSignInErrors(error);

  return { errors, fetchStatus, signIn: signIn ? signIn.__internal_future : null };
});

export const signUpResourceSignal = signal<{ resource: SignUp | null }>({ resource: null });
export const signUpErrorSignal = signal<{ error: ClerkError | null }>({ error: null });
export const signUpFetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });

export const signUpComputedSignal: SignUpSignal = computed(() => {
  const signUp = signUpResourceSignal().resource;
  const error = signUpErrorSignal().error;
  const fetchStatus = signUpFetchSignal().status;

  const errors = errorsToSignUpErrors(error);

  return { errors, fetchStatus, signUp: signUp ? signUp.__internal_future : null };
});

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

  const hasFieldErrors = error.errors.some(error => 'meta' in error && error.meta && 'paramName' in error.meta);
  if (hasFieldErrors) {
    error.errors.forEach(error => {
      if (parsedErrors.raw) {
        parsedErrors.raw.push(error);
      } else {
        parsedErrors.raw = [error];
      }
      if ('meta' in error && error.meta && 'paramName' in error.meta) {
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

function errorsToSignInErrors(error: ClerkError | null): SignInErrors {
  return errorsToParsedErrors(error, {
    identifier: null,
    password: null,
    code: null,
  });
}

function errorsToSignUpErrors(error: ClerkError | null): SignUpErrors {
  return errorsToParsedErrors(error, {
    firstName: null,
    lastName: null,
    emailAddress: null,
    phoneNumber: null,
    password: null,
    username: null,
    code: null,
    captcha: null,
    legalAccepted: null,
  });
}
