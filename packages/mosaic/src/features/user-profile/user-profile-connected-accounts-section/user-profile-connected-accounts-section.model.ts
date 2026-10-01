import { iconImageUrl } from '@clerk/shared/constants';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import { useClerk, useUser } from '@clerk/shared/react';
import type {
  EnterpriseSSOSettings,
  ExternalAccountResource,
  OAuthProvider,
  OAuthProviders,
  OAuthScope,
  OAuthStrategy,
  UserResource,
} from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/useMosaicEnvironment';
import { useMosaicRouter } from '../../../hooks/useMosaicRouter';
import { useMessages } from '../../../localization';
import type {
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from '../user-profile-connected-accounts-section.view';
import type { ConnectedAccountActionResult } from './user-profile-connected-accounts-section.controller';

export type AdditionalOAuthScopes = Partial<Record<OAuthProvider, OAuthScope[]>>;

export type ConnectedAccountRecovery =
  | { kind: 'reauthorize'; additionalScopes: string[] }
  | { kind: 'create'; strategy: OAuthStrategy; additionalScopes: string[] };

export type ConnectedAccountsProjection =
  | { status: 'hidden' }
  | {
      status: 'ready';
      accounts: UserProfileConnectedAccount[];
      availableProviders: UserProfileConnectionProvider[];
    };

const RECONNECT_ERROR_CODES = [
  'external_account_missing_refresh_token',
  'oauth_fetch_user_error',
  'oauth_token_exchange_error',
  'external_account_email_address_verification_required',
];

const MONOCHROME_PROVIDERS = ['agentid', 'apple', 'github', 'okx_wallet', 'vercel', 'x'];

const KNOWN_OAUTH_STRATEGIES: readonly string[] = OAUTH_PROVIDERS.map(p => p.strategy);

export function getProviderDisplay(
  provider: string,
  social: Partial<OAuthProviders>,
): Omit<UserProfileConnectionProvider, 'id'> {
  const known = OAUTH_PROVIDERS.find(p => p.provider === provider);
  if (known) {
    return {
      provider: known.name,
      iconUrl: iconImageUrl(known.provider),
      monochromeIcon: MONOCHROME_PROVIDERS.includes(known.provider),
    };
  }

  const custom = social[`oauth_${provider}` as OAuthStrategy];
  if (custom) {
    return { provider: custom.name || provider, iconUrl: custom.logo_url || undefined };
  }

  return { provider };
}

export function getEnabledOAuthStrategies(social: Partial<OAuthProviders>): OAuthStrategy[] {
  const enabled = Object.values(social)
    .flatMap(settings => (settings?.enabled ? [settings.strategy] : []))
    .sort();
  const known = enabled.filter(strategy => KNOWN_OAUTH_STRATEGIES.includes(strategy));
  const custom = enabled.filter(
    strategy => !KNOWN_OAUTH_STRATEGIES.includes(strategy) && strategy.startsWith('oauth_custom_'),
  );
  return [...known, ...custom];
}

export function allowsIdentificationCreation(user: UserResource, enterpriseSSO: EnterpriseSSOSettings): boolean {
  if (!enterpriseSSO.enabled) {
    return true;
  }
  return !user.enterpriseAccounts.some(
    account => account.active && account.enterpriseConnection?.disableAdditionalIdentifications,
  );
}

function findAdditionalScopes(account: ExternalAccountResource, scopes: AdditionalOAuthScopes | undefined): string[] {
  const requested = scopes?.[account.provider] ?? [];
  const approved = account.approvedScopes.split(' ');
  return requested.some(scope => !approved.includes(scope)) ? requested : [];
}

export function getRecovery(
  account: ExternalAccountResource,
  scopes: AdditionalOAuthScopes | undefined,
): ConnectedAccountRecovery | null {
  const additionalScopes = findAdditionalScopes(account, scopes);
  if (additionalScopes.length > 0 && account.approvedScopes !== '') {
    return { kind: 'reauthorize', additionalScopes };
  }

  if (additionalScopes.length === 0 && !RECONNECT_ERROR_CODES.includes(account.verification?.error?.code ?? '')) {
    return null;
  }

  const verificationStrategy = account.verification?.strategy;
  const strategy = (
    verificationStrategy === 'google_one_tap' ? 'oauth_google' : verificationStrategy || `oauth_${account.provider}`
  ) as OAuthStrategy;
  return { kind: 'create', strategy, additionalScopes };
}

function toAccountRow(
  account: ExternalAccountResource,
  social: Partial<OAuthProviders>,
  scopes: AdditionalOAuthScopes | undefined,
): UserProfileConnectedAccount {
  const error = account.verification?.error;
  const status = getRecovery(account, scopes) ? 'reconnect' : error?.code ? 'error' : 'connected';
  return {
    id: account.id,
    ...getProviderDisplay(account.provider, social),
    identifier: account.username || account.emailAddress || undefined,
    status,
    verificationError: status === 'error' ? error?.longMessage : undefined,
  };
}

export function projectConnectedAccounts({
  user,
  social,
  allowCreation,
  additionalOAuthScopes,
}: {
  user: UserResource;
  social: Partial<OAuthProviders>;
  allowCreation: boolean;
  additionalOAuthScopes?: AdditionalOAuthScopes;
}): ConnectedAccountsProjection {
  const socialEnabled = Object.values(social).some(settings => settings?.enabled);
  if (!socialEnabled || (!allowCreation && user.externalAccounts.length === 0)) {
    return { status: 'hidden' };
  }

  const displayed = [
    ...user.verifiedExternalAccounts,
    ...user.unverifiedExternalAccounts.filter(account => account.verification?.error),
  ];
  const connectedStrategies = user.verifiedExternalAccounts.map(account => `oauth_${account.provider}`);

  return {
    status: 'ready',
    accounts: displayed.map(account => toAccountRow(account, social, additionalOAuthScopes)),
    availableProviders: allowCreation
      ? getEnabledOAuthStrategies(social)
          .filter(strategy => !connectedStrategies.includes(strategy))
          .map(strategy => ({ id: strategy, ...getProviderDisplay(strategy.replace('oauth_', ''), social) }))
      : [],
  };
}

export type UserProfileConnectedAccountsModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      accounts: UserProfileConnectedAccount[];
      availableProviders: UserProfileConnectionProvider[];
      connect: (strategy: string) => Promise<ConnectedAccountActionResult>;
      reconnect: (accountId: string) => Promise<ConnectedAccountActionResult>;
      remove: (accountId: string) => Promise<void>;
    };

export function useUserProfileConnectedAccountsModel({
  additionalOAuthScopes,
  mode,
}: {
  additionalOAuthScopes?: AdditionalOAuthScopes;
  mode?: 'modal' | 'mounted';
}): UserProfileConnectedAccountsModel {
  const m = useMessages('userProfileConnectedAccounts');
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!user) {
    return { status: 'hidden' };
  }

  const projection = projectConnectedAccounts({
    user,
    social: environment.userSettings.social,
    allowCreation: allowsIdentificationCreation(user, environment.userSettings.enterpriseSSO),
    additionalOAuthScopes,
  });
  if (projection.status === 'hidden') {
    return projection;
  }

  const transport = clerk.__internal_oauthTransport;

  // TODO: Add session reverification for account connect, reconnect, and removal;
  // surface API errors until then.
  const guard = async <Result>(run: () => Promise<Result>): Promise<Result> => {
    try {
      return await run();
    } catch (error) {
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

  const completeVerification = async (response: ExternalAccountResource): Promise<ConnectedAccountActionResult> => {
    const url = response.verification?.externalVerificationRedirectURL;
    if (!url) {
      throw new Error('OAuth flow did not receive a verification URL.');
    }

    if (transport) {
      await guard(async () => {
        const { callbackUrl } = await transport.open(url);
        const nonce = new URL(callbackUrl).searchParams.get('rotating_token_nonce');
        await (nonce ? user.reload({ rotatingTokenNonce: nonce }) : user.reload());
      });
      return;
    }

    await router.navigate(url.href);
    return 'redirecting';
  };

  return {
    ...projection,
    connect: async strategy => {
      const provider = strategy.replace('oauth_', '') as OAuthProvider;
      const response = await guard(async () =>
        user.createExternalAccount({
          strategy: strategy as OAuthStrategy,
          redirectUrl: withModalState(await getRedirectUrl(), provider),
          additionalScopes: additionalOAuthScopes ? additionalOAuthScopes[provider] : [],
        }),
      );
      return completeVerification(response);
    },
    reconnect: async accountId => {
      const account = user.externalAccounts.find(candidate => candidate.id === accountId);
      const recovery = account ? getRecovery(account, additionalOAuthScopes) : null;
      if (!account || !recovery) {
        return;
      }

      const response = await guard(async () => {
        const redirectUrl = await getRedirectUrl();
        return recovery.kind === 'reauthorize'
          ? account.reauthorize({
              additionalScopes: recovery.additionalScopes,
              redirectUrl: withModalState(redirectUrl),
            })
          : user.createExternalAccount({
              strategy: recovery.strategy,
              redirectUrl: withModalState(redirectUrl),
              additionalScopes: recovery.additionalScopes,
            });
      });
      return completeVerification(response);
    },
    remove: accountId =>
      guard(async () => {
        await user.externalAccounts.find(account => account.id === accountId)?.destroy();
      }),
  };
}
