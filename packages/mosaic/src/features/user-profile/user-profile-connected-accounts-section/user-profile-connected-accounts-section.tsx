import { isReverificationHint } from '@clerk/shared/authorization-errors';
import { isClerkAPIResponseError, isReverificationCancelledError } from '@clerk/shared/error';
import { useClerk, useUser } from '@clerk/shared/react';
import type { ExternalAccountResource, OAuthProvider, OAuthStrategy } from '@clerk/shared/types';
import type { ReactNode } from 'react';

import { useMosaicEnvironment } from '../../../hooks/useMosaicEnvironment';
import { useMosaicRouter } from '../../../hooks/useMosaicRouter';
import { useMessages } from '../../../localization';
import { useReverificationFlow } from '../../reverification';
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
};

export function UserProfileConnectedAccountsSection({
  additionalOAuthScopes,
  fallback,
  fallbackFocus,
}: UserProfileConnectedAccountsSectionProps) {
  const m = useMessages('userProfileConnectedAccounts');

  // -- Model --
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();
  const transport = clerk.__internal_oauthTransport;

  const toError = (error: unknown): unknown => {
    if (isReverificationCancelledError(error)) {
      return error;
    }
    if (isClerkAPIResponseError(error)) {
      const first = error.errors[0];
      return new Error(first?.longMessage || first?.message || m.errors.generic);
    }
    return new Error(m.errors.generic);
  };

  const createExternalAccount = (strategy: OAuthStrategy, redirectUrl: string, additionalScopes?: string[]) =>
    user?.createExternalAccount({ strategy, redirectUrl, additionalScopes });
  const destroyExternalAccount = async (id: string) => {
    await user?.externalAccounts.find(account => account.id === id)?.destroy();
  };

  const [createWithReverification, createReverification] = useReverificationFlow(createExternalAccount);
  const [destroyWithReverification, destroyReverification] = useReverificationFlow(destroyExternalAccount);

  const getRedirectUrl = async () => (transport ? String(await transport.getRedirectUrl()) : window.location.href);

  const guard = async <Result,>(run: () => Promise<Result>): Promise<Result> => {
    try {
      return await run();
    } catch (error) {
      throw toError(error);
    }
  };

  const completeVerification = async (response: unknown): Promise<ConnectedAccountActionResult> => {
    if (isReverificationHint(response)) {
      throw new Error(m.errors.verificationIncomplete);
    }
    const url = (response as ExternalAccountResource | undefined)?.verification?.externalVerificationRedirectURL;
    if (!url) {
      throw new Error(m.errors.generic);
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
      createWithReverification(
        strategy as OAuthStrategy,
        await getRedirectUrl(),
        additionalOAuthScopes ? additionalOAuthScopes[provider] : [],
      ),
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
        ? account.reauthorize({ additionalScopes: recovery.additionalScopes, redirectUrl })
        : createWithReverification(recovery.strategy, redirectUrl, recovery.additionalScopes);
    });
    return completeVerification(response);
  };

  const remove = async (accountId: string) => {
    const result = await guard(() => destroyWithReverification(accountId));
    if (isReverificationHint(result)) {
      throw new Error(m.errors.verificationIncomplete);
    }
  };

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
    <UserProfileConnectedAccountsSectionView
      {...controller}
      fallbackFocus={fallbackFocus}
      connectReverification={createReverification}
      removeReverification={destroyReverification}
      onRemove={remove}
    />
  );
}
