import { createContext, useContext } from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import type { SignInStrategyName } from '~/internals/machines/shared';

export type SignInStrategyContextValue = {
  strategy: SignInStrategyName | undefined;
};

export const SignInStrategyContext = createContext<SignInStrategyContextValue>({
  strategy: undefined,
});

export function useSignInStrategy() {
  const ctx = useContext(SignInStrategyContext);

  if (!ctx) {
    throw new ClerkElementsRuntimeError(
      'useSignInStrategy must be used within a <SignIn.Strategy> or <SignIn.SupportedStrategy> component.',
    );
  }

  const { strategy } = ctx;

  return strategy;
}
