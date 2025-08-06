import type { SignInFutureResource } from './signIn';

export interface State {
  /**
   * A Signal that updates when the underlying `SignIn` resource changes, including errors.
   */
  signInSignal: {
    (): {
      errors: unknown;
      signIn: SignInFutureResource | null;
    };
    (value: { errors: unknown; signIn: SignInFutureResource | null }): void;
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
