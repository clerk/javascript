import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { useClerk, useReverification, useUser } from '@clerk/shared/react';
import type { OAuthProvider, OAuthStrategy } from '@clerk/shared/types';

import { useRouter } from '@/router';
import { useUserProfileContext } from '@/ui/contexts';
import { useEnabledThirdPartyProviders } from '@/ui/hooks';

import { getExternalVerificationRedirectURL, reloadUserAfterOAuthCallback } from './oauthTransport';
import { useProfileRequestScopeModel } from './profile-request-scope.model';

export type AddConnectedAccountProps = { onClick?: () => void };

export const useAddConnectedAccountModel = () => {
  const { user } = useUser();
  const { strategies } = useEnabledThirdPartyProviders();
  const enabledStrategies = strategies.filter(strategy => strategy.startsWith('oauth')) as OAuthStrategy[];
  const connectedStrategies = user?.verifiedExternalAccounts.map(account => `oauth_${account.provider}`) ?? [];

  return { strategies: enabledStrategies.filter(strategy => !connectedStrategies.includes(strategy)) };
};

export const useConnectMenuButtonModel = (strategy: OAuthStrategy) => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { strategyToDisplayData } = useEnabledThirdPartyProviders();
  const { additionalOAuthScopes, componentName, mode } = useUserProfileContext();
  const scope = useProfileRequestScopeModel(`connect:${strategy}`);
  const isModal = mode === 'modal';
  const displayData = strategyToDisplayData[strategy];

  const createExternalAccount = useReverification((redirectUrl: string) => {
    if (!scope.canRun()) {
      return undefined;
    }
    const socialProvider = strategy.replace('oauth_', '') as OAuthProvider;
    const decoratedRedirectUrl = isModal
      ? appendModalState({ url: redirectUrl, componentName, socialProvider })
      : redirectUrl;
    const additionalScopes = additionalOAuthScopes ? additionalOAuthScopes[socialProvider] : [];

    return clerk.user?.createExternalAccount({ strategy, redirectUrl: decoratedRedirectUrl, additionalScopes });
  });

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    strategy,
    display: { id: displayData.id, name: displayData.name, iconUrl: displayData.iconUrl },
    connect: async () => {
      if (!scope.canRun()) {
        return false;
      }
      try {
        const transport = clerk.__internal_oauthTransport;
        if (transport) {
          const redirectUrl = String(await transport.getRedirectUrl());
          if (!scope.canRun()) {
            return false;
          }
          const response = await createExternalAccount(redirectUrl);
          if (!scope.canRun()) {
            return false;
          }
          const url = getExternalVerificationRedirectURL(response);
          const { callbackUrl } = await transport.open(url);
          if (!scope.canRun() || !clerk.user) {
            return false;
          }
          await reloadUserAfterOAuthCallback(clerk.user, callbackUrl);
          return scope.canRun();
        }

        const response = await createExternalAccount(window.location.href);
        if (!scope.canRun()) {
          return false;
        }
        const url = getExternalVerificationRedirectURL(response);
        await navigate(url.href);
        return scope.canRun();
      } catch (error) {
        if (scope.canRun()) {
          throw error;
        }
        return false;
      }
    },
  };
};
