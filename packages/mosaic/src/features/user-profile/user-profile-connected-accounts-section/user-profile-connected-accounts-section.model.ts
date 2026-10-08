import { iconImageUrl } from '@clerk/shared/constants';
import { ClerkRuntimeError } from '@clerk/shared/error';
import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import { useClerk, useUser } from '@clerk/shared/react';
import type {
  ClerkAPIError,
  CustomOauthProvider,
  EnterpriseAccountConnectionResource,
  EnterpriseAccountResource,
  EnterpriseSSOSettings,
  ExternalAccountResource,
  OAuthProvider,
  OAuthProviders,
  OAuthScope,
  OAuthStrategy,
  VerificationResource,
} from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../../hooks/use-mosaic-router';
import { toProviderIcon } from '../user-profile-provider-icon.model';
import type {
  ConnectedAccountActionResult,
  ConnectedAccountProviderDisplay,
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from './user-profile-connected-accounts-section.types';

type AccountData = Pick<ExternalAccountResource, 'id' | 'provider' | 'approvedScopes' | 'username' | 'emailAddress'> & {
  verification:
    | (Pick<VerificationResource, 'strategy'> & { error: Pick<ClerkAPIError, 'code' | 'longMessage'> | null })
    | null;
};
type EnterpriseUser = {
  enterpriseAccounts: (Pick<EnterpriseAccountResource, 'active'> & {
    enterpriseConnection?: Pick<EnterpriseAccountConnectionResource, 'disableAdditionalIdentifications'> | null;
  })[];
};
type ProjectedUser = {
  verifiedExternalAccounts: AccountData[];
  unverifiedExternalAccounts: AccountData[];
};

export type AdditionalOAuthScopes = Partial<Record<OAuthProvider, OAuthScope[]>>;

export type ConnectedAccountRecovery =
  | { kind: 'reauthorize'; additionalScopes: string[] }
  | { kind: 'create'; strategy: OAuthStrategy; additionalScopes: string[] };

export interface ConnectedAccountProvider {
  strategy: OAuthStrategy;
  provider: OAuthProvider;
  display: ConnectedAccountProviderDisplay;
  enabled: boolean;
}

export interface ConnectedAccountRecoveryState {
  status: UserProfileConnectedAccount['status'];
  plan: ConnectedAccountRecovery | null;
}

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

type SocialSettings = Partial<
  Record<string, Pick<OAuthProviders[OAuthStrategy], 'name' | 'logo_url'> & { strategy: string }>
>;

export function createProviderCatalog(
  enabledStrategies: readonly string[],
  social: SocialSettings,
  accounts: AccountData[] = [],
): ConnectedAccountProvider[] {
  const enabled = new Set(enabledStrategies);
  const providers: ConnectedAccountProvider[] = OAUTH_PROVIDERS.map(({ strategy, provider, name }) => ({
    strategy,
    provider,
    enabled: enabled.has(strategy),
    display: { provider: name, icon: toProviderIcon({ provider, iconUrl: iconImageUrl(provider), label: name }) },
  }));
  const candidates = new Set([
    ...enabledStrategies,
    ...Object.values(social).flatMap(settings => (settings ? [settings.strategy] : [])),
    ...accounts.flatMap(account => [`oauth_${account.provider}`, account.verification?.strategy ?? '']),
  ]);
  for (const candidate of candidates) {
    if (!candidate.startsWith('oauth_custom_')) {
      continue;
    }
    const suffix = candidate.slice('oauth_custom_'.length);
    const strategy: OAuthStrategy = `oauth_custom_${suffix}`;
    const provider: CustomOauthProvider = `custom_${suffix}`;
    const settings = social[strategy];
    providers.push({
      strategy,
      provider,
      enabled: enabled.has(strategy),
      display: {
        provider: settings?.name || provider,
        icon: toProviderIcon({ iconUrl: settings?.logo_url, label: settings?.name || provider }),
      },
    });
  }
  return [
    ...enabledStrategies.flatMap(strategy => {
      const provider = providers.find(provider => provider.strategy === strategy);
      return provider ? [provider] : [];
    }),
    ...providers.filter(provider => !provider.enabled),
  ];
}

export function allowsIdentificationCreation(
  user: EnterpriseUser,
  enterpriseSSO: Pick<EnterpriseSSOSettings, 'enabled'>,
): boolean {
  if (!enterpriseSSO.enabled) {
    return true;
  }
  return !user.enterpriseAccounts.some(
    account => account.active && account.enterpriseConnection?.disableAdditionalIdentifications,
  );
}

function findAdditionalScopes(account: AccountData, scopes: AdditionalOAuthScopes | undefined): string[] {
  const requested = scopes?.[account.provider] ?? [];
  const approved = account.approvedScopes.split(' ');
  return requested.some(scope => !approved.includes(scope)) ? requested : [];
}

export function recoveryFor(
  account: AccountData,
  scopes: AdditionalOAuthScopes | undefined,
  providers: ConnectedAccountProvider[],
): ConnectedAccountRecoveryState {
  const additionalScopes = findAdditionalScopes(account, scopes);
  if (additionalScopes.length > 0 && account.approvedScopes !== '') {
    return { status: 'reconnect', plan: { kind: 'reauthorize', additionalScopes } };
  }
  const error = account.verification?.error;
  if (!error) {
    return { status: 'connected', plan: null };
  }
  const verificationStrategy = account.verification?.strategy;
  const provider = verificationStrategy
    ? providers.find(
        provider =>
          provider.strategy === (verificationStrategy === 'google_one_tap' ? 'oauth_google' : verificationStrategy),
      )
    : providers.find(provider => provider.provider === account.provider);
  return {
    status: RECONNECT_ERROR_CODES.includes(error.code) ? 'reconnect' : 'error',
    plan: provider ? { kind: 'create', strategy: provider.strategy, additionalScopes } : null,
  };
}

function toAccountRow(
  account: AccountData,
  providers: ConnectedAccountProvider[],
  scopes: AdditionalOAuthScopes | undefined,
): UserProfileConnectedAccount {
  const error = account.verification?.error;
  const { status } = recoveryFor(account, scopes, providers);
  return {
    id: account.id,
    ...(providers.find(provider => provider.provider === account.provider)?.display ?? {
      provider: account.provider,
      icon: toProviderIcon({ provider: account.provider, label: account.provider }),
    }),
    identifier: account.username || account.emailAddress || undefined,
    status,
    verificationError: status === 'error' ? error?.longMessage : undefined,
  };
}

export function projectConnectedAccounts({
  user,
  providers,
  socialEnabled,
  allowCreation,
  additionalOAuthScopes,
}: {
  user: ProjectedUser;
  providers: ConnectedAccountProvider[];
  socialEnabled: boolean;
  allowCreation: boolean;
  additionalOAuthScopes?: AdditionalOAuthScopes;
}): ConnectedAccountsProjection {
  if (!socialEnabled) {
    return { status: 'hidden' };
  }

  const displayed = [
    ...user.verifiedExternalAccounts,
    ...user.unverifiedExternalAccounts.filter(account => account.verification?.error),
  ];
  const shownProviders = new Set(displayed.map(account => account.provider));

  return {
    status: 'ready',
    accounts: displayed.map(account => toAccountRow(account, providers, additionalOAuthScopes)),
    availableProviders: allowCreation
      ? providers
          .filter(provider => provider.enabled && !shownProviders.has(provider.provider))
          .map(provider => ({ id: provider.strategy, ...provider.display }))
      : [],
  };
}

export type UserProfileConnectedAccountsModel =
  | { status: 'loading' }
  | { status: 'hidden'; reason: 'no_user' | 'unavailable' }
  | {
      status: 'ready';
      userId: string;
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
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!user) {
    return { status: 'hidden', reason: 'no_user' };
  }

  const providers = createProviderCatalog(
    environment.userSettings.socialProviderStrategies,
    environment.userSettings.social,
    user.externalAccounts,
  );
  const projection = projectConnectedAccounts({
    user,
    providers,
    socialEnabled: environment.userSettings.socialProviderStrategies.length > 0,
    allowCreation: allowsIdentificationCreation(user, environment.userSettings.enterpriseSSO),
    additionalOAuthScopes,
  });
  if (projection.status === 'hidden') {
    return { status: 'hidden', reason: 'unavailable' };
  }

  const userId = user.id;
  const transport = clerk.__internal_oauthTransport;

  const unavailable = () =>
    new ClerkRuntimeError('This connected account is no longer available.', { code: 'connected_account_unavailable' });

  const requireCurrentUser = () => {
    const current = clerk.user;
    if (!current || current.id !== userId) {
      throw unavailable();
    }
    return current;
  };

  const getRedirectUrl = async () => (transport ? String(await transport.getRedirectUrl()) : window.location.href);
  const withModalState = (url: string, socialProvider?: string) =>
    mode === 'modal' ? appendModalState({ url, componentName: 'UserProfile', socialProvider }) : url;

  const completeVerification = async (response: ExternalAccountResource): Promise<ConnectedAccountActionResult> => {
    const url = response.verification?.externalVerificationRedirectURL;
    if (!url) {
      throw new ClerkRuntimeError('OAuth flow did not receive a verification URL.', {
        code: 'oauth_missing_verification_url',
      });
    }

    requireCurrentUser();
    if (transport) {
      const { callbackUrl } = await transport.open(url);
      const nonce = new URL(callbackUrl).searchParams.get('rotating_token_nonce');
      const current = requireCurrentUser();
      await (nonce ? current.reload({ rotatingTokenNonce: nonce }) : current.reload());
      return;
    }

    await router.navigate(url.href);
    return 'redirecting';
  };

  return {
    ...projection,
    userId,
    connect: async strategyId => {
      const provider = providers.find(candidate => candidate.enabled && candidate.strategy === strategyId);
      if (!provider) {
        throw unavailable();
      }
      const redirectUrl = await getRedirectUrl();
      const current = requireCurrentUser();
      const response = await current.createExternalAccount({
        strategy: provider.strategy,
        redirectUrl: withModalState(redirectUrl, provider.provider),
        additionalScopes: additionalOAuthScopes ? additionalOAuthScopes[provider.provider] : [],
      });
      return completeVerification(response);
    },
    reconnect: async accountId => {
      const redirectUrl = await getRedirectUrl();
      const current = requireCurrentUser();
      const account = current.externalAccounts.find(candidate => candidate.id === accountId);
      if (!account) {
        throw unavailable();
      }
      const { plan: recovery } = recoveryFor(account, additionalOAuthScopes, providers);
      if (!recovery) {
        throw unavailable();
      }

      const response =
        recovery.kind === 'reauthorize'
          ? await account.reauthorize({
              additionalScopes: recovery.additionalScopes,
              redirectUrl: withModalState(redirectUrl),
            })
          : await current.createExternalAccount({
              strategy: recovery.strategy,
              redirectUrl: withModalState(redirectUrl),
              additionalScopes: recovery.additionalScopes,
            });
      return completeVerification(response);
    },
    remove: async accountId => {
      const account = requireCurrentUser().externalAccounts.find(candidate => candidate.id === accountId);
      if (!account) {
        throw unavailable();
      }
      await account.destroy();
    },
  };
}
