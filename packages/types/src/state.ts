import type { SignInFutureResource } from './signIn';

interface FieldError {
  code: string;
  longMessage?: string;
  message: string;
}

interface FieldErrors {
  firstName: FieldError | null;
  lastName: FieldError | null;
  emailAddress: FieldError | null;
  identifier: FieldError | null;
  phoneNumber: FieldError | null;
  password: FieldError | null;
  username: FieldError | null;
  code: FieldError | null;
  captcha: FieldError | null;
  legalAccepted: FieldError | null;
}

export interface Errors {
  fields: FieldErrors;
  raw: unknown[];
  global: unknown[]; // does not include any errors that could be parsed as a field error
}

export interface State {
  /**
   * A Signal that updates when the underlying `SignIn` resource changes, including errors.
   */
  signInSignal: {
    (): {
      errors: Errors;
      signIn: SignInFutureResource | null;
    };
  };

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
