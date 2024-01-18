import type { OAuthProvider, OAuthStrategy, SignInStrategy, Web3Provider, Web3Strategy } from '@clerk/types';
import { createActorContext } from '@xstate/react';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import type { SnapshotFrom } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors/error';
import { matchStrategy } from '~/internals/machines/utils/strategies';
import type { UseThirdPartyProviderReturn } from '~/react/common/third-party-providers/social-provider';
import {
  getEnabledThirdPartyProviders,
  isAuthenticatableOauthStrategy,
  isWeb3Strategy,
} from '~/utils/third-party-strategies';

import { SignInMachine } from './sign-in.machine';
import type { SignInStrategyName } from './sign-in.types';

export type SnapshotState = SnapshotFrom<typeof SignInMachine>;

// ================= MACHINE CONTEXT/HOOKS ================= //

export const {
  Provider: SignInFlowProvider,
  useActorRef: useSignInFlow,
  useSelector: useSignInFlowSelector,
} = createActorContext(SignInMachine);

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

/**
 * Selects the clerk environment
 */
const clerkCurrentStrategy = (state: SnapshotState) => state.context.currentFactor?.strategy;

/**
 * Selects the clerk third-party provider
 */
const clerkThirdPartyProviderSelector = (provider: OAuthProvider | Web3Provider) => (state: SnapshotState) =>
  state.context.thirdPartyProviders.providerToDisplayData[provider];

// ================= HOOKS ================= //

export function useStrategy(name: SignInStrategyName) {
  const ctx = useContext(StrategiesContext);

  if (!ctx) {
    throw new ClerkElementsRuntimeError('useSignInStrategy must be used within a <SignInStrategies> component.');
  }

  const { current, preferred, isActive } = ctx;

  return {
    current,
    preferred,
    get shouldRender() {
      return isActive(name);
    },
  };
}

export const useSignInStateMatcher = () => {
  return useSignInFlowSelector(
    state => state,
    (prev, next) => prev.value === next.value,
  );
};

export function useSignInStrategies(_preferred?: SignInStrategy) {
  const state = useSignInStateMatcher();
  const current = useSignInFlowSelector(clerkCurrentStrategy);

  const shouldRender = state.matches('FirstFactor') || state.matches('SecondFactor');

  const isActive = useCallback((name: string) => (current ? matchStrategy(current, name) : false), [current]);

  return {
    current,
    isActive,
    shouldRender,
  };
}

/**
 * Provides the onClick handler for oauth
 *
 * @experimental
 */
export const useSignInThirdPartyProviders = () => {
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

export const useSignInThirdPartyProvider = (provider: OAuthProvider | Web3Provider): UseThirdPartyProviderReturn => {
  const ref = useSignInFlow();
  const details = useSignInFlowSelector(clerkThirdPartyProviderSelector(provider));

  const authenticate = useCallback(
    (event: React.MouseEvent<Element>) => {
      if (!details) return;

      event.preventDefault();

      if (provider === 'metamask') {
        return ref.send({ type: 'AUTHENTICATE.WEB3', strategy: 'web3_metamask_signature' });
      }

      return ref.send({ type: 'AUTHENTICATE.OAUTH', strategy: `oauth_${provider}` });
    },
    [provider, details, ref],
  );

  if (!details) {
    console.warn(`Please ensure that ${provider} is enabled.`);
    return null;
  }

  return {
    events: {
      authenticate,
    },
    ...details,
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
