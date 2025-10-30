import { useClerk } from '@clerk/shared/react';
import type { EnterpriseSSOStrategy, OAuthProvider, SamlStrategy, Web3Provider } from '@clerk/types';
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
  isEnterpriseSSOStrategy,
  isSamlStrategy,
  isWeb3Strategy,
  providerToDisplayData,
} from '~/utils/third-party-strategies';

const useIsProviderEnabled = (
  provider: OAuthProvider | Web3Provider | SamlStrategy | EnterpriseSSOStrategy,
): boolean | null => {
  const clerk = useClerk();

  // null indicates we don't know for sure
  if (!clerk.loaded) {
    return null;
  }

  if (provider === 'saml' || provider === 'enterprise_sso') {
    return (
      // @ts-expect-error - __unstable__environment is not typed
      clerk.__unstable__environment?.userSettings.saml.enabled ??
      // @ts-expect-error - __unstable__environment is not typed
      clerk.__unstable__environment?.userSettings.enterpriseSSO.enabled ??
      false
    );
  }

  const data = getEnabledThirdPartyProviders(
    // @ts-expect-error - __unstable__environment is not typed
    clerk.__unstable__environment as EnvironmentResource,
  );

  return (
    isAuthenticatableOauthStrategy(provider, data.authenticatableOauthStrategies) ||
    isWeb3Strategy(provider, data.web3Strategies)
  );
};

export const useThirdPartyProvider = <
  TActor extends ActorRef<any, SignInRouterEvents> | ActorRef<any, SignUpRouterEvents>,
>(
  ref: TActor,
  provider: OAuthProvider | Web3Provider | SamlStrategy | EnterpriseSSOStrategy,
): UseThirdPartyProviderReturn => {
  const isProviderEnabled = useIsProviderEnabled(provider);
  const isSaml = isSamlStrategy(provider);
  const isEnterpriseSSO = isEnterpriseSSOStrategy(provider);
  const details =
    isEnterpriseSSO || isSaml
      ? {
          name: 'SSO',
          strategy: provider,
        }
      : providerToDisplayData[provider];

  const authenticate = useCallback(
    (event: React.MouseEvent<Element>) => {
      if (!isProviderEnabled) {
        return;
      }

      event.preventDefault();

      if (isSaml) {
        return ref.send({ type: 'AUTHENTICATE.SAML' });
      }

      if (isEnterpriseSSO) {
        return ref.send({ type: 'AUTHENTICATE.ENTERPRISE_SSO' });
      }

      if (provider === 'base') {
        return ref.send({ type: 'AUTHENTICATE.WEB3', strategy: 'web3_base_signature' });
      }

      if (provider === 'metamask') {
        return ref.send({ type: 'AUTHENTICATE.WEB3', strategy: 'web3_metamask_signature' });
      }

      if (provider === 'coinbase_wallet') {
        return ref.send({ type: 'AUTHENTICATE.WEB3', strategy: 'web3_coinbase_wallet_signature' });
      }

      if (provider === 'okx_wallet') {
        return ref.send({ type: 'AUTHENTICATE.WEB3', strategy: 'web3_okx_wallet_signature' });
      }

      return ref.send({ type: 'AUTHENTICATE.OAUTH', strategy: `oauth_${provider}` });
    },
    [provider, isProviderEnabled, isSaml, isEnterpriseSSO, ref],
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
