import { useClerk } from '@clerk/clerk-react';
import type { OAuthProvider, Web3Provider } from '@clerk/types';
import type React from 'react';
import { useCallback } from 'react';
import type { ActorRef } from 'xstate';

import type { SignInRouterEvents } from '~/internals/machines/sign-in/types';
import type { SignUpRouterEvents } from '~/internals/machines/sign-up/types';
import type { UseThirdPartyProviderReturn } from '~/react/common/providers';
import {
  getEnabledThirdPartyProviders,
  isAuthenticatableOauthStrategy,
  providerToDisplayData,
} from '~/utils/third-party-strategies';

const useIsProviderEnabled = (provider: OAuthProvider | Web3Provider): boolean | null => {
  const clerk = useClerk();

  // null indicates we don't know for sure
  if (!clerk.loaded) return null;

  const data = getEnabledThirdPartyProviders(clerk.__unstable__environment);

  return isAuthenticatableOauthStrategy(provider, data.authenticatableOauthStrategies);
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
      if (!isProviderEnabled) return;

      event.preventDefault();

      if (provider === 'metamask') {
        return ref.send({ type: 'AUTHENTICATE.WEB3', strategy: 'web3_metamask_signature' });
      }

      return ref.send({ type: 'AUTHENTICATE.OAUTH', strategy: `oauth_${provider}` });
    },
    [provider, isProviderEnabled, ref],
  );

  if (isProviderEnabled === false) {
    console.error(
      `Please ensure that ${provider} is enabled for your project. Go to your Clerk dashboard and navigate to "User & Authentication" > "Social Connections" to enable it.`,
    );
  }

  return {
    events: {
      authenticate,
    },
    ...details,
  };
};
