import type { OAuthStrategy, Web3Strategy } from '@clerk/types';
import { createActorContext } from '@xstate/react';
import type React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import type { SnapshotFrom } from 'xstate';

import {
  getEnabledThirdPartyProviders,
  isAuthenticatableOauthStrategy,
  isWeb3Strategy,
} from '../../utils/third-party-strategies';
import { SignInMachine } from './sign-in.machine';

export type SnapshotState = SnapshotFrom<typeof SignInMachine>;

// ================= MACHINE CONTEXT/HOOKS ================= //

export const {
  Provider: SignInFlowProvider,
  useActorRef: useSignInFlow,
  useSelector: useSignInFlowSelector,
} = createActorContext(SignInMachine);

// ================= SELECTORS ================= //

/**
 * Selects the clerk environment
 */
const clerkEnvironmentSelector = (state: SnapshotState) => state.context.environment;

// ================= HOOKS ================= //

export const useSignInState = () => {
  return useSignInFlowSelector(
    state => state,
    // (prev, next) => prev.value === next.value && prev.tags === next.tags,
  );
};

/**
 * Provides the onClick handler for oauth
 */
export const useThirdPartyProviders = () => {
  const ref = useSignInFlow();
  const env = useSignInFlowSelector(clerkEnvironmentSelector);
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

/**
 * Ensures that the callback handler is sent to the machine once the environment is loaded
 */
export const useSSOCallbackHandler = () => {
  const ref = useSignInFlow();
  const hasEnv = useSignInFlowSelector(clerkEnvironmentSelector);

  // TODO: Wholesale move this to the machine ?
  // Wait for the environment to be loaded before sending the callback event
  useEffect(() => {
    if (!hasEnv) {
      return;
    }

    ref.send({ type: 'OAUTH.CALLBACK' });
  }, [hasEnv]); // eslint-disable-line react-hooks/exhaustive-deps
};
