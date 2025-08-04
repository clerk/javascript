import type { SignInBetaResource } from './signIn';

export interface State {
  signInSignal: {
    (): {
      errors: unknown;
      signIn: SignInBetaResource | null;
    };
    (value: { errors: unknown; signIn: SignInBetaResource | null }): void;
  };
  __internal_effect: (callback: () => void) => () => void;
  __internal_computed: <T>(getter: (previousValue?: T) => T) => () => T;
}
