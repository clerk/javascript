import { useContext } from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors/error';
import type { SignInStrategyName } from '~/internals/machines/sign-in/sign-in.types';
import { StrategiesContext } from '~/react/sign-in/contexts/strategies.context';

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
