import type { SignInFutureResource } from './signInFuture';
import type { SignUpFutureResource } from './signUpFuture';

/**
 * Represents an error on a specific field.
 */
export interface FieldError {
  /**
   * The error code of the error, returned by the Clerk API.
   */
  code: string;
  /**
   * A more detailed message that describes the error.
   */
  longMessage?: string;
  /**
   * A message that describes the error.
   */
  message: string;
}

/**
 * Represents the collection of possible errors on known fields.
 */
export interface FieldErrors {
  /**
   * The error for the first name field.
   */
  firstName: FieldError | null;
  /**
   * The error for the last name field.
   */
  lastName: FieldError | null;
  /**
   * The error for the email address field.
   */
  emailAddress: FieldError | null;
  /**
   * The error for the identifier field.
   */
  identifier: FieldError | null;
  /**
   * The error for the phone number field.
   */
  phoneNumber: FieldError | null;
  /**
   * The error for the password field.
   */
  password: FieldError | null;
  /**
   * The error for the username field.
   */
  username: FieldError | null;
  /**
   * The error for the code field.
   */
  code: FieldError | null;
  /**
   * The error for the captcha field.
   */
  captcha: FieldError | null;
  /**
   * The error for the legal accepted field.
   */
  legalAccepted: FieldError | null;
}

/**
 * Represents the errors that occurred during the last fetch of the parent resource.
 */
export interface Errors {
  /**
   * Represents the collection of possible errors on known fields.
   */
  fields: FieldErrors;
  /**
   * The raw, unparsed errors from the Clerk API.
   */
  raw: unknown[];
  /**
   * Parsed errors that are not related to any specific field.
   */
  global: unknown[]; // does not include any errors that could be parsed as a field error
}

/**
 * The value returned by the `useSignInSignal` hook.
 */
export interface SignInSignalValue {
  /**
   * Represents the errors that occurred during the last fetch of the parent resource.
   */
  errors: Errors;
  /**
   * The fetch status of the underlying `SignIn` resource.
   */
  fetchStatus: 'idle' | 'fetching';
  /**
   * An instance representing the currently active `SignIn`, with new APIs designed specifically for custom flows.
   */
  signIn: SignInFutureResource;
}
export type NullableSignInSignal = Omit<SignInSignalValue, 'signIn'> & {
  signIn: SignInFutureResource | null;
};
export interface SignInSignal {
  (): NullableSignInSignal;
}

export interface SignUpSignalValue {
  /**
   * The errors that occurred during the last fetch of the underlying `SignUp` resource.
   */
  errors: Errors;
  /**
   * The fetch status of the underlying `SignUp` resource.
   */
  fetchStatus: 'idle' | 'fetching';
  /**
   * The underlying `SignUp` resource.
   */
  signUp: SignUpFutureResource;
}
export type NullableSignUpSignal = Omit<SignUpSignalValue, 'signUp'> & {
  signUp: SignUpFutureResource | null;
};
export interface SignUpSignal {
  (): NullableSignUpSignal;
}

export interface State {
  /**
   * A Signal that updates when the underlying `SignIn` resource changes, including errors.
   */
  signInSignal: SignInSignal;

  /**
   * A Signal that updates when the underlying `SignUp` resource changes, including errors.
   */
  signUpSignal: SignUpSignal;

  /**
   * @experimental This experimental API is subject to change.
   *
   * An alias for `effect()` from `alien-signals`, which can be used to subscribe to changes from Signals.
   *
   * @see https://github.com/stackblitz/alien-signals#usage
   */
  __internal_effect: (callback: () => void) => () => void;

  /**
   * @experimental This experimental API is subject to change.
   *
   * An alias for `computed()` from `alien-signals`, which can be used to create a computed Signal that updates when
   * its dependencies change.
   *
   * @see https://github.com/stackblitz/alien-signals#usage
   */
  __internal_computed: <T>(getter: (previousValue?: T) => T) => () => T;
}
