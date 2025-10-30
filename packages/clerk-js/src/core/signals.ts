import { isClerkAPIResponseError } from '@clerk/shared/error';
import { snakeToCamel } from '@clerk/shared/underscore';
import type { Errors, SignInSignal, SignUpSignal, WaitlistSignal } from '@clerk/types';
import { computed, signal } from 'alien-signals';

import type { SignIn } from './resources/SignIn';
import type { SignUp } from './resources/SignUp';
import type { Waitlist } from './resources/Waitlist';

interface ResourceSignalSet<TResource extends { __internal_future: any }, TComputedSignal> {
  resourceSignal: ReturnType<typeof signal<{ resource: TResource | null }>>;
  errorSignal: ReturnType<typeof signal<{ error: unknown }>>;
  fetchSignal: ReturnType<typeof signal<{ status: 'idle' | 'fetching' }>>;
  computedSignal: TComputedSignal;
}

function createResourceSignalSet<
  TResource extends { __internal_future: any },
  TSignalName extends string,
  TComputedSignal extends () => { errors: Errors; fetchStatus: 'idle' | 'fetching'; [K in TSignalName]: any },
>(
  resourceName: TSignalName,
): ResourceSignalSet<TResource, TComputedSignal> {
  const resourceSignal = signal<{ resource: TResource | null }>({ resource: null });
  const errorSignal = signal<{ error: unknown }>({ error: null });
  const fetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });

  const computedSignal = computed(() => {
    const resource = resourceSignal().resource;
    const error = errorSignal().error;
    const fetchStatus = fetchSignal().status;
    const errors = errorsToParsedErrors(error);

    return {
      errors,
      fetchStatus,
      [resourceName]: resource ? resource.__internal_future : null,
    } as ReturnType<TComputedSignal>;
  }) as TComputedSignal;

  return {
    resourceSignal,
    errorSignal,
    fetchSignal,
    computedSignal,
  };
}

const signInSignals = createResourceSignalSet<SignIn, 'signIn', SignInSignal>('signIn');
export const signInResourceSignal = signInSignals.resourceSignal;
export const signInErrorSignal = signInSignals.errorSignal;
export const signInFetchSignal = signInSignals.fetchSignal;
export const signInComputedSignal = signInSignals.computedSignal;

const signUpSignals = createResourceSignalSet<SignUp, 'signUp', SignUpSignal>('signUp');
export const signUpResourceSignal = signUpSignals.resourceSignal;
export const signUpErrorSignal = signUpSignals.errorSignal;
export const signUpFetchSignal = signUpSignals.fetchSignal;
export const signUpComputedSignal = signUpSignals.computedSignal;

const waitlistSignals = createResourceSignalSet<Waitlist, 'waitlist', WaitlistSignal>('waitlist');
export const waitlistResourceSignal = waitlistSignals.resourceSignal;
export const waitlistErrorSignal = waitlistSignals.errorSignal;
export const waitlistFetchSignal = waitlistSignals.fetchSignal;
export const waitlistComputedSignal = waitlistSignals.computedSignal;

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
