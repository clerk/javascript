import { iconImageUrl } from '@clerk/shared/constants';
import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import { useClerk, useUser } from '@clerk/shared/react';
import type {
  CustomOauthProvider,
  EnterpriseSSOSettings,
  ExternalAccountResource,
  OAuthProvider,
  OAuthProviders,
  OAuthScope,
  OAuthStrategy,
} from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/useMosaicEnvironment';
import { useMosaicRouter } from '../../../hooks/useMosaicRouter';
import { useErrorText, useMessages } from '../../../localization';
import { connectedAccountErrorMessage } from './user-profile-connected-accounts-feedback';
import type {
  ConnectedAccountActionResult,
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from './user-profile-connected-accounts-section.types';
import { ConnectedAccountActionError } from './user-profile-connected-accounts-section.types';

type AccountData = Pick<ExternalAccountResource, 'id' | 'provider' | 'approvedScopes' | 'username' | 'emailAddress'> & {
  verification: {
    strategy: string | null;
    error: { code: string; longMessage?: string } | null;
  } | null;
};
type EnterpriseUser = {
  enterpriseAccounts: {
    active: boolean;
    enterpriseConnection?: { disableAdditionalIdentifications: boolean } | null;
  }[];
};
type ProjectedUser = {
  externalAccounts: AccountData[];
  verifiedExternalAccounts: AccountData[];
  unverifiedExternalAccounts: AccountData[];
};

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

type SocialSettings = Partial<
  Record<string, Pick<OAuthProviders[OAuthStrategy], 'enabled' | 'name' | 'logo_url'> & { strategy: string }>
>;

export function getProviderDisplay(
  provider: string,
  social: SocialSettings,
): Omit<UserProfileConnectionProvider, 'id'> {
  const known = OAUTH_PROVIDERS.find(p => p.provider === provider);
  if (known) {
    return {
      provider: known.name,
      iconUrl: iconImageUrl(known.provider),
      monochromeIcon: MONOCHROME_PROVIDERS.includes(known.provider),
    };
  }

  const custom = Object.values(social).find(settings => settings?.strategy === `oauth_${provider}`);
  if (custom) {
    return { provider: custom.name || provider, iconUrl: custom.logo_url || undefined };
  }

  return { provider };
}

export function getEnabledOAuthStrategies(social: SocialSettings): OAuthStrategy[] {
  const enabled = Object.values(social)
    .flatMap(settings => (settings?.enabled ? [settings.strategy] : []))
    .sort();
  const known = enabled.flatMap(strategy => {
    const provider = OAUTH_PROVIDERS.find(provider => provider.strategy === strategy);
    return provider ? [provider.strategy] : [];
  });
  const custom = enabled.flatMap(strategy => {
    if (!strategy.startsWith('oauth_custom_')) {
      return [];
    }
    const customStrategy: OAuthStrategy = `oauth_custom_${strategy.slice('oauth_custom_'.length)}`;
    return [customStrategy];
  });
  return [...known, ...custom];
}

function providerFor(strategy: OAuthStrategy): OAuthProvider {
  const known = OAUTH_PROVIDERS.find(p => p.strategy === strategy);
  if (known) {
    return known.provider;
  }
  const custom: CustomOauthProvider = `custom_${strategy.slice('oauth_custom_'.length)}`;
  return custom;
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

export function getRecovery(
  account: AccountData,
  scopes: AdditionalOAuthScopes | undefined,
): ConnectedAccountRecovery | null {
  const additionalScopes = findAdditionalScopes(account, scopes);
  if (additionalScopes.length > 0 && account.approvedScopes !== '') {
    return { kind: 'reauthorize', additionalScopes };
  }

  if (!RECONNECT_ERROR_CODES.includes(account.verification?.error?.code ?? '')) {
    return null;
  }

  return createRecovery(account, additionalScopes);
}

export function getRetry(
  account: AccountData,
  scopes: AdditionalOAuthScopes | undefined,
): ConnectedAccountRecovery | null {
  if (!account.verification?.error) {
    return null;
  }
  return createRecovery(account, findAdditionalScopes(account, scopes));
}

function createRecovery(account: AccountData, additionalScopes: string[]): ConnectedAccountRecovery {
  const verificationStrategy = account.verification?.strategy;
  const strategy = (
    verificationStrategy === 'google_one_tap' ? 'oauth_google' : verificationStrategy || `oauth_${account.provider}`
  ) as OAuthStrategy;
  return { kind: 'create', strategy, additionalScopes };
}

function toAccountRow(
  account: AccountData,
  social: SocialSettings,
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
  user: ProjectedUser;
  social: SocialSettings;
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
  const shownStrategies = displayed.map(account => `oauth_${account.provider}`);

  return {
    status: 'ready',
    accounts: displayed.map(account => toAccountRow(account, social, additionalOAuthScopes)),
    availableProviders: allowCreation
      ? getEnabledOAuthStrategies(social)
          .filter(strategy => !shownStrategies.includes(strategy))
          .map(strategy => ({ id: strategy, ...getProviderDisplay(strategy.replace('oauth_', ''), social) }))
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
  const messages = useMessages('userProfileConnectedAccounts');
  const errorText = useErrorText();

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!user) {
    return { status: 'hidden', reason: 'no_user' };
  }

  const projection = projectConnectedAccounts({
    user,
    social: environment.userSettings.social,
    allowCreation: allowsIdentificationCreation(user, environment.userSettings.enterpriseSSO),
    additionalOAuthScopes,
  });
  if (projection.status === 'hidden') {
    return { status: 'hidden', reason: 'unavailable' };
  }

  const userId = user.id;
  const transport = clerk.__internal_oauthTransport;

  const currentUser = () => {
    const current = clerk.user;
    if (!current || current.id !== userId) {
      throw new ConnectedAccountActionError('unavailable');
    }
    return current;
  };

  const getRedirectUrl = async () => (transport ? String(await transport.getRedirectUrl()) : window.location.href);
  const withModalState = (url: string, socialProvider?: string) =>
    mode === 'modal' ? appendModalState({ url, componentName: 'UserProfile', socialProvider }) : url;

  const completeVerification = async (response: ExternalAccountResource): Promise<ConnectedAccountActionResult> => {
    const url = response.verification?.externalVerificationRedirectURL;
    if (!url) {
      throw new ConnectedAccountActionError('missing_verification_url');
    }

    if (transport) {
      const { callbackUrl } = await transport.open(url);
      const nonce = new URL(callbackUrl).searchParams.get('rotating_token_nonce');
      const current = currentUser();
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
      try {
        const current = currentUser();
        const strategy = getEnabledOAuthStrategies(environment.userSettings.social).find(
          candidate => candidate === strategyId,
        );
        if (!strategy) {
          throw new ConnectedAccountActionError('unavailable');
        }
        const provider = providerFor(strategy);
        const redirectUrl = await getRedirectUrl();
        const response = await current.createExternalAccount({
          strategy,
          redirectUrl: withModalState(redirectUrl, provider),
          additionalScopes: additionalOAuthScopes ? additionalOAuthScopes[provider] : [],
        });
        return await completeVerification(response);
      } catch (error) {
        throw new Error(connectedAccountErrorMessage(error, messages, errorText));
      }
    },
    reconnect: async accountId => {
      try {
        const current = currentUser();
        const account = current.externalAccounts.find(candidate => candidate.id === accountId);
        if (!account) {
          throw new ConnectedAccountActionError('unavailable');
        }
        const recovery = getRecovery(account, additionalOAuthScopes) ?? getRetry(account, additionalOAuthScopes);
        if (!recovery) {
          return;
        }

        const redirectUrl = await getRedirectUrl();
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
        return await completeVerification(response);
      } catch (error) {
        throw new Error(connectedAccountErrorMessage(error, messages, errorText));
      }
    },
    remove: async accountId => {
      try {
        const account = currentUser().externalAccounts.find(candidate => candidate.id === accountId);
        if (!account) {
          throw new ConnectedAccountActionError('unavailable');
        }
        await account.destroy();
      } catch (error) {
        throw new Error(connectedAccountErrorMessage(error, messages, errorText));
      }
    },
  };
}
