import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import type { OAuthStrategy } from '@clerk/shared/types';

import type { ClerkSessionsHost } from './clerk';
import type { LoomClient } from './client';
import type { ProfileActionOptions, ProfileActions } from './profile-actions-types';
import type { ProfileEnvironment, ProfileOAuthResponse } from './profile-host-types';

type User = NonNullable<ClerkSessionsHost['user']>;
type Account = NonNullable<User['externalAccounts']>[number];
type Recovery =
  | { kind: 'reauthorize'; additionalScopes: string[] }
  | { kind: 'create'; strategy: OAuthStrategy; additionalScopes: string[] };

export function connectedAccountActions(
  host: ClerkSessionsHost,
  owner: LoomClient,
  current: () => User,
  environment: () => ProfileEnvironment,
  navigate: (url: string) => Promise<void>,
  options: ProfileActionOptions,
): ProfileActions['connectedAccounts'] {
  const strategyFor = (value: string): OAuthStrategy | undefined => {
    if (value.startsWith('oauth_custom_')) {
      return `oauth_custom_${value.slice('oauth_custom_'.length)}`;
    }
    return OAUTH_PROVIDERS.find(item => item.strategy === value)?.strategy;
  };
  const account = (id: string) => {
    if (environment().userSettings.socialProviderStrategies.length === 0) {
      throw new Error('Connected account unavailable.');
    }
    const target = current().externalAccounts?.find(item => item.id === id);
    if (!target) {
      throw new Error('Connected account unavailable.');
    }
    return target;
  };
  const provider = (id: string) => {
    const policy = environment().userSettings;
    const user = current();
    const strategy = strategyFor(id);
    if (!strategy || !policy.socialProviderStrategies.includes(strategy)) {
      return undefined;
    }
    if (
      policy.enterpriseSSO.enabled &&
      user.enterpriseAccounts?.some(item => item.active && item.enterpriseConnection?.disableAdditionalIdentifications)
    ) {
      return undefined;
    }
    const provider = strategy.slice('oauth_'.length);
    if (
      user.externalAccounts?.some(
        item => item.provider === provider && (item.verification?.status === 'verified' || item.verification?.error),
      )
    ) {
      return undefined;
    }
    return { strategy, provider };
  };
  const recovery = (target: Account): Recovery | undefined => {
    const requested = options.additionalOAuthScopes?.[target.provider] ?? [];
    const approved = (target.approvedScopes ?? '').split(' ');
    const additionalScopes = requested.some(scope => !approved.includes(scope)) ? requested : [];
    if (additionalScopes.length > 0 && target.approvedScopes) {
      return { kind: 'reauthorize', additionalScopes };
    }
    if (!target.verification?.error) {
      return undefined;
    }
    const candidate =
      target.verification.strategy === 'google_one_tap'
        ? 'oauth_google'
        : (target.verification.strategy ?? `oauth_${target.provider}`);
    const strategy = strategyFor(candidate);
    return strategy ? { kind: 'create', strategy, additionalScopes } : undefined;
  };
  const redirectUrl = async () => {
    current();
    const result = host.__internal_oauthTransport
      ? String(await host.__internal_oauthTransport.getRedirectUrl())
      : window.location.href;
    current();
    return result;
  };
  const modalUrl = (url: string, socialProvider?: string) =>
    options.mode === 'modal' ? appendModalState({ url, componentName: 'UserProfile', socialProvider }) : url;
  const complete = async (response: ProfileOAuthResponse): Promise<void | 'redirecting'> => {
    current();
    const url = response.verification?.externalVerificationRedirectURL;
    if (!url) {
      throw new Error('OAuth flow did not receive a verification URL.');
    }
    const transport = host.__internal_oauthTransport;
    if (transport) {
      const { callbackUrl } = await transport.open(url);
      const target = current();
      if (!target.reload) {
        throw new Error('User reload unavailable.');
      }
      const nonce = new URL(callbackUrl).searchParams.get('rotating_token_nonce');
      await (nonce ? target.reload({ rotatingTokenNonce: nonce }) : target.reload());
      current();
      await owner.invalidateUser();
      current();
      return;
    }
    await navigate(url.href);
    return 'redirecting';
  };
  const user = current();
  const available = Boolean(host.__internal_environment?.userSettings.socialProviderStrategies.length);
  return {
    available,
    canManageAccount: id => Boolean(user.externalAccounts?.some(item => item.id === id)),
    canReconnectAccount: id => {
      const target = user.externalAccounts?.find(item => item.id === id);
      return Boolean(target && recovery(target));
    },
    canConnectProvider: id => available && Boolean(provider(id)),
    connect:
      available && user.createExternalAccount
        ? async id => {
            if (!provider(id)) {
              throw new Error('Connected account unavailable.');
            }
            const url = await redirectUrl();
            const selected = provider(id);
            const user = current();
            if (!selected || !user.createExternalAccount) {
              throw new Error('Connected account unavailable.');
            }
            const response = await user.createExternalAccount({
              strategy: selected.strategy,
              redirectUrl: modalUrl(url, selected.provider),
              additionalScopes: options.additionalOAuthScopes?.[selected.provider] ?? [],
            });
            current();
            return complete(response);
          }
        : undefined,
    reconnect: available
      ? async id => {
          const initial = recovery(account(id));
          if (!initial) {
            throw new Error('Connected account unavailable.');
          }
          const url = await redirectUrl();
          const requireRecovery = () => {
            const target = account(id);
            if (JSON.stringify(recovery(target)) !== JSON.stringify(initial)) {
              throw new Error('Connected account recovery changed.');
            }
            return target;
          };
          let response: ProfileOAuthResponse | undefined;
          if (initial.kind === 'reauthorize') {
            const target = requireRecovery();
            if (!target.reauthorize) {
              throw new Error('Connected account unavailable.');
            }
            response = await target.reauthorize({
              additionalScopes: initial.additionalScopes,
              redirectUrl: modalUrl(url),
            });
            current();
          } else {
            const create = async () => {
              requireRecovery();
              const user = current();
              if (!user.createExternalAccount) {
                throw new Error('Connected account unavailable.');
              }
              response = await user.createExternalAccount({
                strategy: initial.strategy,
                redirectUrl: modalUrl(url),
                additionalScopes: initial.additionalScopes,
              });
              current();
            };
            if (options.reverifyReconnect) {
              await options.reverifyReconnect(create);
            } else {
              await create();
            }
            current();
          }
          if (!response) {
            throw new Error('Connected account unavailable.');
          }
          return complete(response);
        }
      : undefined,
    remove: available
      ? id =>
          owner.mutateProfile(async () => {
            const target = account(id);
            if (!target.destroy) {
              throw new Error('Connected account unavailable.');
            }
            await target.destroy();
            current();
          })
      : undefined,
  };
}
