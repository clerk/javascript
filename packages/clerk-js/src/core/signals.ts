import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { Errors } from '@clerk/types';
import { computed, signal } from 'alien-signals';

import type { SignIn } from './resources/SignIn';

export const signInSignal = signal<{ resource: SignIn | null }>({ resource: null });
export const signInErrorSignal = signal<{ error: unknown }>({ error: null });

export const signInComputedSignal = computed(() => {
  const signIn = signInSignal().resource;
  const error = signInErrorSignal().error;

  const errors = errorsToParsedErrors(error);

  if (!signIn) {
    return { errors, signIn: null };
  }

  return { errors, signIn: signIn.__internal_future };
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
