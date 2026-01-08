import type { ClerkGlobalHookError } from '../errors/globalHookError';
import type { SignInFutureResource } from './signInFuture';
import type { SignUpFutureResource } from './signUpFuture';
import type { WaitlistResource } from './waitlist';

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
 * Represents the errors that occurred during the last fetch of the parent resource.
 */
export interface Errors<T> {
  /**
   * Represents the collection of possible errors on known fields.
   */
  fields: T;
  /**
   * The raw, unparsed errors from the Clerk API.
   */
  raw: unknown[] | null;
  /**
   * Parsed errors that are not related to any specific field.
   * Does not include any errors that could be parsed as a field error
   */
  global: ClerkGlobalHookError[] | null;
}

/**
 * Fields available for SignIn errors.
 */
export interface SignInFields {
  /**
   * The error for the identifier field.
   */
  identifier: FieldError | null;
  /**
   * The error for the password field.
   */
  password: FieldError | null;
  /**
   * The error for the code field.
   */
  code: FieldError | null;
}

/**
 * Fields available for SignUp errors.
 */
export interface SignUpFields {
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
 * Fields available for Waitlist errors.
 */
export interface WaitlistFields {
  /**
   * The error for the email address field.
   */
  emailAddress: FieldError | null;
}

/**
 * Errors type for SignIn operations.
 */
export type SignInErrors = Errors<SignInFields>;

/**
 * Errors type for SignUp operations.
 */
export type SignUpErrors = Errors<SignUpFields>;

/**
 * Errors type for Waitlist operations.
 */
export type WaitlistErrors = Errors<WaitlistFields>;

/**
 * The value returned by the `useSignInSignal` hook.
 */
export interface SignInSignalValue {
  /**
   * Represents the errors that occurred during the last fetch of the parent resource.
   */
  errors: SignInErrors;
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
  errors: SignUpErrors;
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

export interface WaitlistSignalValue {
  /**
   * The errors that occurred during the last fetch of the underlying `Waitlist` resource.
   */
  errors: WaitlistErrors;
  /**
   * The fetch status of the underlying `Waitlist` resource.
   */
  fetchStatus: 'idle' | 'fetching';
  /**
   * The underlying `Waitlist` resource.
   */
  waitlist: WaitlistResource;
}
export type NullableWaitlistSignal = Omit<WaitlistSignalValue, 'waitlist'> & {
  waitlist: WaitlistResource | null;
};
export interface WaitlistSignal {
  (): NullableWaitlistSignal;
}

/**
 * Signal names that can be retrieved via getSignal().
 */
export type SignalName = 'signIn' | 'signUp' | 'waitlist';

/**
 * Map of signal names to their return types.
 */
export interface SignalTypeMap {
  signIn: SignInSignal;
  signUp: SignUpSignal;
  waitlist: WaitlistSignal;
}

export interface State {
  /**
   * Get a signal by name. Enables dynamic signal lookup via registry.
   *
   * @param type - The signal name ('signIn', 'signUp', 'waitlist')
   * @returns The computed signal for the given resource type
   *
   * @experimental This experimental API is subject to change.
   */
  getSignal(type: 'signIn'): SignInSignal | undefined;
  getSignal(type: 'signUp'): SignUpSignal | undefined;
  getSignal(type: 'waitlist'): WaitlistSignal | undefined;
  getSignal(type: SignalName): SignInSignal | SignUpSignal | WaitlistSignal | undefined;

  /**
   * An alias for `effect()` from `alien-signals`, which can be used to subscribe to changes from Signals.
   *
   * @see https://github.com/stackblitz/alien-signals#usage
   *
   * @experimental This experimental API is subject to change.
   */
  __internal_effect: (callback: () => void) => () => void;

  /**
   * An alias for `computed()` from `alien-signals`, which can be used to create a computed Signal that updates when
   * its dependencies change.
   *
   * @see https://github.com/stackblitz/alien-signals#usage
   *
   * @experimental This experimental API is subject to change.
   */
  __internal_computed: <T>(getter: (previousValue?: T) => T) => () => T;
  /**
   * An instance of the Waitlist resource.
   */
  __internal_waitlist: WaitlistResource;
}
