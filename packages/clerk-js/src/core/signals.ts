import { isClerkAPIResponseError } from '@clerk/shared/error';
import { snakeToCamel } from '@clerk/shared/underscore';
import type { Errors, SignInSignal, SignUpSignal, WaitlistSignal } from '@clerk/types';
import { computed, signal } from 'alien-signals';

import type { SignIn } from './resources/SignIn';
import type { SignUp } from './resources/SignUp';
import type { Waitlist } from './resources/Waitlist';

export const signInResourceSignal = signal<{ resource: SignIn | null }>({ resource: null });
export const signInErrorSignal = signal<{ error: unknown }>({ error: null });
export const signInFetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });

export const signInComputedSignal: SignInSignal = computed(() => {
  const signIn = signInResourceSignal().resource;
  const error = signInErrorSignal().error;
  const fetchStatus = signInFetchSignal().status;

  const errors = errorsToParsedErrors(error);

  return { errors, fetchStatus, signIn: signIn ? signIn.__internal_future : null };
});

export const signUpResourceSignal = signal<{ resource: SignUp | null }>({ resource: null });
export const signUpErrorSignal = signal<{ error: unknown }>({ error: null });
export const signUpFetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });

export const signUpComputedSignal: SignUpSignal = computed(() => {
  const signUp = signUpResourceSignal().resource;
  const error = signUpErrorSignal().error;
  const fetchStatus = signUpFetchSignal().status;

  const errors = errorsToParsedErrors(error);

  return { errors, fetchStatus, signUp: signUp ? signUp.__internal_future : null };
});

export const waitlistResourceSignal = signal<{ resource: Waitlist | null }>({ resource: null });
export const waitlistErrorSignal = signal<{ error: unknown }>({ error: null });
export const waitlistFetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });

export const waitlistComputedSignal: WaitlistSignal = computed(() => {
  const waitlist = waitlistResourceSignal().resource;
  const error = waitlistErrorSignal().error;
  const fetchStatus = waitlistFetchSignal().status;

  const errors = errorsToParsedErrors(error);

  return { errors, fetchStatus, waitlist: waitlist ? waitlist.__internal_future : null };
});

/**
 * Converts an error to a parsed errors object that reports the specific fields that the error pertains to. Will put
 * generic non-API errors into the global array.
 */
function errorsToParsedErrors(error: unknown): Errors {
  const parsedErrors: Errors = {
    fields: {
      firstName: null,
      lastName: null,
      emailAddress: null,
      identifier: null,
      phoneNumber: null,
      password: null,
      username: null,
      code: null,
      captcha: null,
      legalAccepted: null,
    },
    raw: null,
    global: null,
  };

  if (!error) {
    return parsedErrors;
  }

  if (!isClerkAPIResponseError(error)) {
    parsedErrors.raw = [error];
    parsedErrors.global = [error];
    return parsedErrors;
  }

  error.errors.forEach(error => {
    if (parsedErrors.raw) {
      parsedErrors.raw.push(error);
    } else {
      parsedErrors.raw = [error];
    }

    if ('meta' in error && error.meta && 'paramName' in error.meta) {
      const name = snakeToCamel(error.meta.paramName);
      parsedErrors.fields[name as keyof typeof parsedErrors.fields] = error;
      return;
    }

    if (parsedErrors.global) {
      parsedErrors.global.push(error);
    } else {
      parsedErrors.global = [error];
    }
  });

  return parsedErrors;
}
