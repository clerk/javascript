import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { Errors, SignInSignal, SignUpSignal } from '@clerk/types';
import { computed, signal } from 'alien-signals';

import type { SignIn } from './resources/SignIn';
import type { SignUp } from './resources/SignUp';

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
    raw: [],
    global: [],
  };

  if (!error) {
    return parsedErrors;
  }

  if (!isClerkAPIResponseError(error)) {
    parsedErrors.raw.push(error);
    parsedErrors.global.push(error);
    return parsedErrors;
  }

  parsedErrors.raw.push(...error.errors);

  error.errors.forEach(error => {
    if ('meta' in error && error.meta && 'paramName' in error.meta) {
      switch (error.meta.paramName) {
        case 'first_name':
          parsedErrors.fields.firstName = error;
          break;
        case 'last_name':
          parsedErrors.fields.lastName = error;
          break;
        case 'email_address':
          parsedErrors.fields.emailAddress = error;
          break;
        case 'identifier':
          parsedErrors.fields.identifier = error;
          break;
        case 'phone_number':
          parsedErrors.fields.phoneNumber = error;
          break;
        case 'password':
          parsedErrors.fields.password = error;
          break;
        case 'username':
          parsedErrors.fields.username = error;
          break;
        case 'code':
          parsedErrors.fields.code = error;
          break;
        case 'captcha':
          parsedErrors.fields.captcha = error;
          break;
        case 'legal_accepted':
          parsedErrors.fields.legalAccepted = error;
          break;
        default:
          parsedErrors.global.push(error);
          break;
      }
    } else {
      parsedErrors.global.push(error);
    }
  });

  return parsedErrors;
}
