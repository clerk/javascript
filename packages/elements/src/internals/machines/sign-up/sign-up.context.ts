import type { OAuthStrategy, SignInStrategy, Web3Strategy } from '@clerk/types';
import { createActorContext } from '@xstate/react';
import type React from 'react';
import { createContext, useCallback, useMemo } from 'react';
import type { SnapshotFrom } from 'xstate';

import {
  getEnabledThirdPartyProviders,
  isAuthenticatableOauthStrategy,
  isWeb3Strategy,
} from '~/utils/third-party-strategies';

import { SignUpMachine } from './sign-up.machine';

export type SnapshotState = SnapshotFrom<typeof SignUpMachine>;

// ================= MACHINE CONTEXT/HOOKS ================= //

export const {
  Provider: SignUpFlowProvider,
  useActorRef: useSignUpFlow,
  useSelector: useSignUpFlowSelector,
} = createActorContext(SignUpMachine);

// ================= CONTEXTS ================= //

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

// ================= SELECTORS ================= //

/**
 * Selects the clerk environment
 */
const clerkEnvironmentSelector = (state: SnapshotState) => state.context.clerk.__unstable__environment;

// ================= HOOKS ================= //

export const useSignUpStateMatcher = () => {
  return useSignUpFlowSelector(
    state => state,
    (prev, next) => prev.value === next.value,
  );
};

/**
 * Provides the onClick handler for oauth
 */
export const useSignUpThirdPartyProviders = () => {
  const ref = useSignUpFlow();
  const env = useSignUpFlowSelector(clerkEnvironmentSelector);
  const providers = useMemo(() => env && getEnabledThirdPartyProviders(env), [env]);

  // Register the onSubmit handler for button click
  const createOnClick = useCallback(
    (strategy: Web3Strategy | OAuthStrategy) => {
      return (event: React.MouseEvent<Element>) => {
        if (!providers) return;

        event.preventDefault();

        if (isWeb3Strategy(strategy, providers.web3Strategies)) {
          return ref.send({ type: 'AUTHENTICATE.WEB3', strategy });
        }

        if (isAuthenticatableOauthStrategy(strategy, providers.authenticatableOauthStrategies)) {
          return ref.send({ type: 'AUTHENTICATE.OAUTH', strategy });
        }

        throw new Error(`${strategy} is not yet supported.`);
      };
    },
    [ref, providers],
  );

  if (!providers) {
    return null;
  }

  return {
    ...providers,
    createOnClick,
  };
};
