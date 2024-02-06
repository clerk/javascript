import type { SignInStrategy } from '@clerk/types';
import { createContext, useContext } from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors/error';
import type { SignInStrategyName } from '~/internals/machines/sign-in/sign-in.types';

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
    throw new ClerkElementsRuntimeError('useStrategy must be used within a <SignInVerification> component.');
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
