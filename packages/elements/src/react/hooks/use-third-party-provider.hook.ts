import { useClerk } from '@clerk/clerk-react';
import type { OAuthProvider, Web3Provider } from '@clerk/types';
import type React from 'react';
import { useCallback } from 'react';
import type { ActorRef } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import type { SignInRouterEvents } from '~/internals/machines/sign-in';
import type { SignUpRouterEvents } from '~/internals/machines/sign-up';
import type { UseThirdPartyProviderReturn } from '~/react/common/connections';
import {
  getEnabledThirdPartyProviders,
  isAuthenticatableOauthStrategy,
  isWeb3Strategy,
  providerToDisplayData,
} from '~/utils/third-party-strategies';

const useIsProviderEnabled = (provider: OAuthProvider | Web3Provider): boolean | null => {
  const clerk = useClerk();

  // null indicates we don't know for sure
  if (!clerk.loaded) {
    return null;
  }

  const data = getEnabledThirdPartyProviders(clerk.__unstable__environment);

  return (
    isAuthenticatableOauthStrategy(provider, data.authenticatableOauthStrategies) ||
    isWeb3Strategy(provider, data.web3Strategies)
  );
};

export const useThirdPartyProvider = <
  TActor extends ActorRef<any, SignInRouterEvents> | ActorRef<any, SignUpRouterEvents>,
>(
  ref: TActor,
  provider: OAuthProvider | Web3Provider,
): UseThirdPartyProviderReturn => {
  const isProviderEnabled = useIsProviderEnabled(provider);
  const details = providerToDisplayData[provider];

  const authenticate = useCallback(
    (event: React.MouseEvent<Element>) => {
      if (!isProviderEnabled) {
        return;
      }

      event.preventDefault();

      if (provider === 'metamask') {
        return ref.send({ type: 'AUTHENTICATE.WEB3', strategy: 'web3_metamask_signature' });
      }

      return ref.send({ type: 'AUTHENTICATE.OAUTH', strategy: `oauth_${provider}` });
    },
    [provider, isProviderEnabled, ref],
  );

  if (isProviderEnabled === false) {
    const dashboardPath = `https://dashboard.clerk.com/last-active?path=/user-authentication/${provider === 'metamask' ? 'web3' : 'social-connections'}`;

    throw new ClerkElementsRuntimeError(
      `You have used <Connection name="${provider}"> which isn't enabled for your project. Enable ${details.name} in your Clerk dashboard: ${dashboardPath}`,
    );
  }

  return {
    events: {
      authenticate,
    },
    ...details,
  };
};
