import type { SignInStrategy } from '@clerk/shared/types';
import { createContext, useContext } from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import type { SignInStrategyName } from '~/internals/machines/shared';

export type StrategiesContextValue = {
  current: SignInStrategy | undefined;
  isActive: (name: string) => boolean;
  preferred: SignInStrategy | undefined;
};

export const StrategiesContext = createContext<StrategiesContextValue>({
  current: undefined,
  isActive: _name => false,
  preferred: undefined,
});

export function useStrategy(name: SignInStrategyName) {
  const ctx = useContext(StrategiesContext);

  if (!ctx) {
    throw new ClerkElementsRuntimeError(
      'useStrategy must be used within a <SignIn.Step name="verifications"> component. Did you mean to `import { Step } from "@clerk/elements/sign-up"` instead?',
    );
  }

  const { current, preferred, isActive } = ctx;

  return {
    current,
    preferred,
    get active() {
      return isActive(name);
    },
  };
}
