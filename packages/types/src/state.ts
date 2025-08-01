import type { SignInResource } from './signIn';

export interface State {
  signInSignal: {
    (): {
      resource: SignInResource | null;
    };
    (value: { resource: SignInResource | null }): void;
  };
  __internal_effect: (callback: () => void) => () => void;
  __internal_computed: <T>(getter: (previousValue?: T) => T) => () => T;
}
