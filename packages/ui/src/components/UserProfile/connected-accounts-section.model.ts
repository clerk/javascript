import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { useClerk, useReverification, useUser } from '@clerk/shared/react';
import type { ExternalAccountResource, OAuthProvider, OAuthScope, OAuthStrategy } from '@clerk/shared/types';

import { useRouter } from '@/router';
import { useUserProfileContext } from '@/ui/contexts';
import { useEnabledThirdPartyProviders } from '@/ui/hooks';

import { getExternalVerificationRedirectURL, reloadUserAfterOAuthCallback } from './oauthTransport';
import { useProfileRequestScopeModel } from './profile-request-scope.model';

export type ConnectedAccountsSectionProps = { shouldAllowCreation?: boolean };

const errorCodesForReconnect = [
  /**
   * Some Oauth providers will generate a refresh token only the first time the user gives consent to the app.
   */
  'external_account_missing_refresh_token',
  /**
   * Provider is experiencing an issue currently.
   */
  'oauth_fetch_user_error',
  /**
   * Provider is experiencing an issue currently (same as above).
   */
  'oauth_token_exchange_error',
  /**
   * User's associated email address is required to be verified, because it was initially created as unverified.
   */
  'external_account_email_address_verification_required',
];

export const useConnectedAccountsSectionModel = () => {
  const { user } = useUser();
  const scope = useProfileRequestScopeModel('connected-accounts');

  return {
    requestKey: scope.requestKey,
    hasUser: !!user,
    hasExternalAccounts: Boolean(user?.externalAccounts?.length),
    accountIds: user
      ? [
          ...user.verifiedExternalAccounts,
          ...user.unverifiedExternalAccounts.filter(account => account.verification?.error),
        ].map(account => account.id)
      : [],
  };
};

export const useConnectedAccountModel = (accountId: string) => {
  const { additionalOAuthScopes, componentName, mode } = useUserProfileContext();
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { user } = useUser();
  const scope = useProfileRequestScopeModel(`reconnect:${accountId}`);
  const account = user?.externalAccounts.find(account => account.id === accountId);
  const resolve = () =>
    scope.canRun() ? clerk.user?.externalAccounts.find(account => account.id === accountId) : undefined;
  const canRun = () => !!resolve();
  const additionalScopes = account ? findAdditionalScopes(account, additionalOAuthScopes) : [];
  const reauthorizationRequired = additionalScopes.length > 0 && account?.approvedScopes != '';
  const shouldDisplayReconnect =
    errorCodesForReconnect.includes(account?.verification?.error?.code || '') || reauthorizationRequired;
  const verificationStrategy = account?.verification?.strategy;
  const strategy = (
    verificationStrategy === 'google_one_tap' ? 'oauth_google' : verificationStrategy || `oauth_${account?.provider}`
  ) as OAuthStrategy;
  const createExternalAccount = useReverification((redirectUrl: string) =>
    canRun() ? clerk.user?.createExternalAccount({ strategy, redirectUrl, additionalScopes }) : undefined,
  );
  const { providerToDisplayData } = useEnabledThirdPartyProviders();
  const providerData = account ? providerToDisplayData[account.provider] : undefined;

  return {
    requestKey: scope.requestKey,
    canRun,
    exists: !!account,
    id: accountId,
    provider: account?.provider,
    providerName: providerData?.name || account?.provider || '',
    providerIconUrl: providerData?.iconUrl,
    label: account?.username || account?.emailAddress,
    fallbackErrorMessage: account?.verification?.error?.longMessage,
    hasErrorCode: !!account?.verification?.error?.code,
    shouldDisplayReconnect,
    reconnect: async () => {
      if (!canRun()) {
        return false;
      }
      try {
        const transport = clerk.__internal_oauthTransport;
        const redirectUrl = transport ? String(await transport.getRedirectUrl()) : window.location.href;
        const currentAccount = resolve();
        if (!currentAccount) {
          return false;
        }
        const decoratedRedirectUrl =
          mode === 'modal' ? appendModalState({ url: redirectUrl, componentName }) : redirectUrl;
        let response: ExternalAccountResource | undefined;
        if (reauthorizationRequired) {
          response = await currentAccount.reauthorize({ additionalScopes, redirectUrl: decoratedRedirectUrl });
        } else {
          response = await createExternalAccount(decoratedRedirectUrl);
        }

        if (!canRun()) {
          return false;
        }

        const url = getExternalVerificationRedirectURL(response);
        if (transport) {
          const { callbackUrl } = await transport.open(url);
          if (!canRun() || !clerk.user) {
            return false;
          }
          await reloadUserAfterOAuthCallback(clerk.user, callbackUrl);
          return scope.canRun();
        }

        await navigate(url.href);
        return scope.canRun();
      } catch (error) {
        if (canRun()) {
          throw error;
        }
        return false;
      }
    },
  };
};

function findAdditionalScopes(
  account: ExternalAccountResource,
  scopes?: Partial<Record<OAuthProvider, OAuthScope[]>>,
): string[] {
  if (!scopes) {
    return [];
  }

  const additionalScopes = scopes[account.provider] || [];
  const currentScopes = account.approvedScopes.split(' ');
  const missingScopes = additionalScopes.filter(scope => !currentScopes.includes(scope));
  if (missingScopes.length === 0) {
    return [];
  }

  return additionalScopes;
}
