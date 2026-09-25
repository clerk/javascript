import { iconImageUrl } from '@clerk/shared/constants';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import type {
  EnterpriseSSOSettings,
  ExternalAccountResource,
  OAuthProvider,
  OAuthProviders,
  OAuthScope,
  OAuthStrategy,
  UserResource,
} from '@clerk/shared/types';

import type {
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from '../user-profile-connected-accounts-section.view';

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

  if (!RECONNECT_ERROR_CODES.includes(account.verification?.error?.code ?? '')) {
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
