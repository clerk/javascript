import type { SignInFutureResource } from './signIn';

export interface State {
  signInSignal: {
    (): {
      errors: unknown;
      signIn: SignInFutureResource | null;
    };
    (value: { errors: unknown; signIn: SignInFutureResource | null }): void;
  };
  __internal_effect: (callback: () => void) => () => void;
  __internal_computed: <T>(getter: (previousValue?: T) => T) => () => T;
}
