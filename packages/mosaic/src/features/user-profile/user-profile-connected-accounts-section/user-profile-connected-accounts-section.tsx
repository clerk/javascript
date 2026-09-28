import { isClerkAPIResponseError, isReverificationCancelledError } from '@clerk/shared/error';
import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { useClerk, useUser } from '@clerk/shared/react';
import type {
  CreateExternalAccountParams,
  ExternalAccountResource,
  OAuthProvider,
  OAuthStrategy,
} from '@clerk/shared/types';
import type { ReactNode } from 'react';

import { useMosaicEnvironment } from '../../../hooks/useMosaicEnvironment';
import { useMosaicRouter } from '../../../hooks/useMosaicRouter';
import { useMessages } from '../../../localization';
import { Reverification, useReverificationFlow } from '../../reverification';
import { UserProfileConnectedAccountsSectionView } from '../user-profile-connected-accounts-section.view';
import type { ConnectedAccountActionResult } from './user-profile-connected-accounts-section.controller';
import { useUserProfileConnectedAccountsController } from './user-profile-connected-accounts-section.controller';
import type { AdditionalOAuthScopes } from './user-profile-connected-accounts-section.model';
import {
  allowsIdentificationCreation,
  getRecovery,
  projectConnectedAccounts,
} from './user-profile-connected-accounts-section.model';

export type UserProfileConnectedAccountsSectionProps = {
  additionalOAuthScopes?: AdditionalOAuthScopes;
  fallback?: ReactNode;
  fallbackFocus?: () => HTMLElement | null;
  mode?: 'modal' | 'mounted';
};

export function UserProfileConnectedAccountsSection({
  additionalOAuthScopes,
  fallback,
  fallbackFocus,
  mode,
}: UserProfileConnectedAccountsSectionProps) {
  const m = useMessages('userProfileConnectedAccounts');

  // -- Model --
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();
  const transport = clerk.__internal_oauthTransport;
  const [createExternalAccount, createReverification] = useReverificationFlow((params: CreateExternalAccountParams) =>
    user?.createExternalAccount(params),
  );
  const [destroyAccount, removeReverification] = useReverificationFlow((accountId: string) =>
    user?.externalAccounts.find(account => account.id === accountId)?.destroy(),
  );

  const guard = async <Result,>(run: () => Promise<Result>): Promise<Result> => {
    try {
      return await run();
    } catch (error) {
      if (isReverificationCancelledError(error)) {
        throw error;
      }
      if (isClerkAPIResponseError(error)) {
        const first = error.errors[0];
        throw new Error(first?.longMessage || first?.message || m.errors.generic);
      }
      throw new Error(m.errors.generic);
    }
  };

  const getRedirectUrl = async () => (transport ? String(await transport.getRedirectUrl()) : window.location.href);
  const withModalState = (url: string, socialProvider?: string) =>
    mode === 'modal' ? appendModalState({ url, componentName: 'UserProfile', socialProvider }) : url;

  const completeVerification = async (
    response: ExternalAccountResource | undefined,
  ): Promise<ConnectedAccountActionResult> => {
    const url = response?.verification?.externalVerificationRedirectURL;
    if (!url) {
      throw new Error('OAuth flow did not receive a verification URL.');
    }

    if (transport) {
      await guard(async () => {
        const { callbackUrl } = await transport.open(url);
        const nonce = new URL(callbackUrl).searchParams.get('rotating_token_nonce');
        await (nonce ? user?.reload({ rotatingTokenNonce: nonce }) : user?.reload());
      });
      return;
    }

    await router.navigate(url.href);
    return 'redirecting';
  };

  const connect = async (strategy: string) => {
    const provider = strategy.replace('oauth_', '') as OAuthProvider;
    const response = await guard(async () =>
      createExternalAccount({
        strategy: strategy as OAuthStrategy,
        redirectUrl: withModalState(await getRedirectUrl(), provider),
        additionalScopes: additionalOAuthScopes ? additionalOAuthScopes[provider] : [],
      }),
    );
    return completeVerification(response);
  };

  const reconnect = async (accountId: string) => {
    const account = user?.externalAccounts.find(candidate => candidate.id === accountId);
    const recovery = account ? getRecovery(account, additionalOAuthScopes) : null;
    if (!account || !recovery) {
      return;
    }

    const response = await guard(async () => {
      const redirectUrl = await getRedirectUrl();
      return recovery.kind === 'reauthorize'
        ? account.reauthorize({ additionalScopes: recovery.additionalScopes, redirectUrl: withModalState(redirectUrl) })
        : createExternalAccount({
            strategy: recovery.strategy,
            redirectUrl: withModalState(redirectUrl),
            additionalScopes: recovery.additionalScopes,
          });
    });
    return completeVerification(response);
  };

  const remove = (accountId: string) =>
    guard(async () => {
      await destroyAccount(accountId);
    });

  const projection =
    user && environment
      ? projectConnectedAccounts({
          user,
          social: environment.userSettings.social,
          allowCreation: allowsIdentificationCreation(user, environment.userSettings.enterpriseSSO),
          additionalOAuthScopes,
        })
      : ({ status: 'hidden' } as const);

  // -- Controller --
  const controller = useUserProfileConnectedAccountsController({
    accounts: projection.status === 'ready' ? projection.accounts : [],
    availableProviders: projection.status === 'ready' ? projection.availableProviders : [],
    onConnect: connect,
    onReconnect: reconnect,
    fallbackErrorMessage: m.errors.generic,
  });

  // -- View --
  if (!isLoaded || !environment) {
    return fallback ?? null;
  }

  if (projection.status === 'hidden') {
    return null;
  }

  return (
    <>
      <UserProfileConnectedAccountsSectionView
        {...controller}
        fallbackFocus={fallbackFocus}
        onRemove={remove}
        removeReverification={removeReverification}
      />
      <Reverification {...createReverification} />
    </>
  );
}
