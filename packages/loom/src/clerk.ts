import type { Clerk, EmailAddressResource, ExternalAccountResource, UserResource } from '@clerk/shared/types';

import { parseEnterpriseConnections } from './enterprise-connections';
import { createProfileActions } from './profile-actions';
import type { ProfileEnvironment, ProfileOAuthResponse } from './profile-host-types';
export type ClerkSessionsHost = {
  loaded: boolean;
  publishableKey: string;
  frontendApi: string;
  proxyUrl: string | undefined;
  domain: string;
  user:
    | {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        username?: string | null;
        imageUrl?: string;
        hasImage?: boolean;
        passwordEnabled?: boolean;
        deleteSelfEnabled?: boolean;
        externalAccounts?: readonly {
          id: string;
          provider: string;
          username?: string | null;
          emailAddress: string;
          verification?: {
            status: string | null;
            strategy?: string | null;
            error?: { code: string; longMessage?: string } | null;
            externalVerificationRedirectURL?: URL | null;
          } | null;
          approvedScopes?: string;
          reauthorize?: (input: Parameters<ExternalAccountResource['reauthorize']>[0]) => Promise<ProfileOAuthResponse>;
          destroy?: () => Promise<unknown>;
        }[];
        primaryEmailAddressId?: string | null;
        emailAddresses?: readonly {
          id: string;
          emailAddress: string;
          verification?: { status: string | null; externalVerificationRedirectURL?: URL | null } | null;
          matchesSsoConnection?: boolean;
          prepareVerification?: (
            input: Parameters<EmailAddressResource['prepareVerification']>[0],
          ) => Promise<{ verification: { externalVerificationRedirectURL: URL | null } }>;
          attemptVerification?: (input: Parameters<EmailAddressResource['attemptVerification']>[0]) => Promise<unknown>;
          createEmailLinkFlow?: () => {
            startEmailLinkFlow: (input: { redirectUrl: string }) => Promise<unknown>;
            cancelEmailLinkFlow: () => void;
          };
          destroy?: () => Promise<unknown>;
        }[];
        primaryPhoneNumberId?: string | null;
        phoneNumbers?: UserResource['phoneNumbers'];
        createPhoneNumber?: UserResource['createPhoneNumber'];
        primaryWeb3WalletId?: string | null;
        web3Wallets?: UserResource['web3Wallets'];
        createWeb3Wallet?: UserResource['createWeb3Wallet'];
        passkeys?: UserResource['passkeys'];
        createPasskey?: UserResource['createPasskey'];
        totpEnabled?: boolean;
        backupCodeEnabled?: boolean;
        createTOTP?: () => Promise<{ secret?: string | null; uri?: string | null }>;
        verifyTOTP?: (input: { code: string }) => Promise<{ backupCodes?: string[] | null }>;
        disableTOTP?: () => Promise<unknown>;
        createBackupCode?: () => Promise<{ codes: string[] }>;
        enterpriseAccounts?: readonly {
          id?: string;
          enterpriseConnectionId?: string | null;
          emailAddress?: string;
          active: boolean;
          enterpriseConnection?: { disableAdditionalIdentifications?: boolean; name?: string } | null;
        }[];
        update?(input: Parameters<UserResource['update']>[0]): Promise<unknown>;
        createEmailAddress?: (input: Parameters<UserResource['createEmailAddress']>[0]) => Promise<{ id: string }>;
        createExternalAccount?: (
          input: Parameters<UserResource['createExternalAccount']>[0],
        ) => Promise<ProfileOAuthResponse>;
        updatePassword?: (...input: Parameters<UserResource['updatePassword']>) => Promise<unknown>;
        setProfileImage?: (...input: Parameters<UserResource['setProfileImage']>) => Promise<unknown>;
        delete?: () => Promise<unknown>;
        reload?: (...input: Parameters<UserResource['reload']>) => Promise<unknown>;
      }
    | null
    | undefined;
  session: { id: string; publicUserData?: { identifier?: string | null } } | null | undefined;
  __internal_environment?: ProfileEnvironment | null;
  __internal_subscribeEnvironment?: (listener: () => void) => () => void;
  __internal_oauthTransport?: Clerk['__internal_oauthTransport'];
  __internal_moduleManager?: Clerk['__internal_moduleManager'];
  __internal_country?: string | null;
  isSatellite?: boolean;
  navigate?: Clerk['navigate'];
  setActive?: Clerk['setActive'];
  buildAfterSignOutUrl?: Clerk['buildAfterSignOutUrl'];
  buildAfterMultiSessionSingleSignOutUrl?: Clerk['buildAfterMultiSessionSingleSignOutUrl'];
  client?: { signedInSessions: readonly { user?: { id: string } | null }[] };
  addListener: (listener: () => void) => () => void;
  on: (event: 'status', listener: () => void) => void;
  off: (event: 'status', listener: () => void) => void;
  __internal_readUser?: (input: { userId: string; sessionId: string; signal: AbortSignal }) => Promise<unknown>;
  getFapiClient?: () => {
    request: (request: {
      method: string;
      path: string;
      sessionId: string;
      signal: AbortSignal;
      body?: BodyInit;
      search?: Record<string, string>;
    }) => Promise<Response & { payload: unknown }>;
  };
};

function scopeOf(host: ClerkSessionsHost): SessionScope | null {
  if (!host.loaded || !host.user || !host.session) {
    return null;
  }
  return createClerkScope(host, { userId: host.user.id, sessionId: host.session.id });
}

export function bindClerk(host: ClerkSessionsHost, hydration?: LoomHydration) {
  let client: LoomClient | null = null;
  let signedOutOwner: LoomClient | null = null;
  let disposed = false;
  let seed = hydration;
  let hydrationAllowed = hydration !== undefined;
  let resolved = false;
  let profile: string | undefined;
  const listeners = new Set<() => void>();
  const matchesDeletionScope = (scope: SessionScope) =>
    host.loaded &&
    createClerkScope(host, scope).instanceKey === scope.instanceKey &&
    (!host.user || host.user.id === scope.userId) &&
    (!host.session || host.session.id === scope.sessionId);
  const sync = () => {
    if (disposed) {
      return;
    }
    const scope = scopeOf(host);
    if (signedOutOwner && !matchesDeletionScope(signedOutOwner.scope)) {
      signedOutOwner = null;
    }
    if (host.loaded && (!hydration || !sameScope(hydration.scope, scope))) {
      hydrationAllowed = false;
    }
    const wasResolved = resolved;
    resolved ||= host.loaded;
    if (host.loaded && !scope) {
      seed = undefined;
    }
    let nextProfile: string | undefined;
    if (host.user) {
      try {
        nextProfile = JSON.stringify(resourceUserSnapshot(host.user, host.user.id));
      } catch {
        nextProfile = undefined;
      }
    }
    if (sameScope(scope, client?.scope ?? null) && wasResolved === resolved) {
      client?.notifyActions();
      if (profile !== nextProfile) {
        profile = nextProfile;
        void client?.invalidateUser().catch(() => {});
      }
      return;
    }
    profile = nextProfile;
    signedOutOwner = null;
    if (!scope && client && matchesDeletionScope(client.scope)) {
      try {
        client.assertLive();
        signedOutOwner = client;
      } catch {
        signedOutOwner = null;
      }
    }
    client?.dispose();
    client = null;
    if (scope) {
      const initial = seed && sameScope(seed.scope, scope) ? seed : undefined;
      const reconcileUser = initial?.user && profile !== JSON.stringify(userSnapshot(initial.user.data, scope.userId));
      const request = async (method: string, path: string, signal: AbortSignal, search?: Record<string, string>) => {
        if (disposed || !sameScope(scope, scopeOf(host))) {
          throw new Error('Clerk identity changed.');
        }
        if (typeof host.getFapiClient !== 'function') {
          throw new Error('Clerk transport is unavailable. Use a Clerk host with transport support.');
        }
        const response = await host
          .getFapiClient()
          .request({
            method,
            path,
            signal,
            sessionId: scope.sessionId,
            ...(search ? { search } : {}),
            ...(method === 'POST' ? { body: '' } : {}),
          });
        if (disposed || !sameScope(scope, scopeOf(host))) {
          throw new Error('Clerk identity changed.');
        }
        if (!response.ok) {
          throwResponseError(response);
        }
        return response.payload;
      };
      client = createLoomClient({
        scope,
        profileActions: (owner, options) =>
          createProfileActions(
            host,
            owner,
            () => {
              owner.assertLive();
              if (disposed || !sameScope(scope, scopeOf(host))) {
                throw new Error('Clerk identity changed.');
              }
            },
            options,
            () => {
              if (disposed || !matchesDeletionScope(owner.scope)) {
                return false;
              }
              if (signedOutOwner === owner) {
                return true;
              }
              if (client !== owner) {
                return false;
              }
              try {
                owner.assertLive();
                return true;
              } catch {
                return false;
              }
            },
          ),
        hydration: initial,
        readProfileSettings: async signal => parseProfileSettings(await request('GET', '/environment', signal)),
        readEnterpriseConnections: async signal =>
          parseEnterpriseConnections(
            await request('GET', '/me/enterprise_connections', signal, { with_organization_account_linking: 'true' }),
          ),
        readUser: async signal => {
          if (disposed || !sameScope(scope, scopeOf(host))) {
            throw new Error('Clerk identity changed.');
          }
          if (typeof host.__internal_readUser !== 'function') {
            throw new Error('Clerk user read is unavailable. Use a Clerk host with user read support.');
          }
          const user = await host.__internal_readUser({ userId: scope.userId, sessionId: scope.sessionId, signal });
          if (disposed || !sameScope(scope, scopeOf(host))) {
            throw new Error('Clerk identity changed.');
          }
          return resourceUserSnapshot(user, scope.userId);
        },
        updateName:
          typeof host.user?.update === 'function'
            ? async input => {
                if (disposed || !sameScope(scope, scopeOf(host)) || !host.user) {
                  throw new Error('Clerk identity changed.');
                }
                const current = host.user;
                if (current.enterpriseAccounts?.some(account => account.active)) {
                  throw new Error('Name is managed by enterprise SSO.');
                }
                if (typeof current.update !== 'function') {
                  throw new Error('Clerk name update is unavailable.');
                }
                const updated = await current.update(input);
                if (disposed || !sameScope(scope, scopeOf(host)) || host.user?.id !== current.id) {
                  throw new Error('Clerk identity changed.');
                }
                return resourceUserSnapshot(updated, scope.userId);
              }
            : undefined,
        transport: {
          read: async signal => parseSessions(await request('GET', '/me/sessions/active', signal)),
          revoke: async (id, signal) => {
            await request('POST', `/me/sessions/${encodeURIComponent(id)}/revoke`, signal);
          },
        },
      });
      if (reconcileUser) {
        void client.queryClient.invalidateQueries({
          queryKey: client.userQueryOptions().queryKey,
          exact: true,
          refetchType: 'none',
        });
      }
    }
    if (scope) {
      seed = undefined;
    }
    for (const listener of listeners) {
      listener();
    }
  };
  const unsubscribeEnvironment = host.__internal_subscribeEnvironment?.(() => {
    sync();
    const current = client;
    if (current) {
      void current.queryClient.invalidateQueries({
        queryKey: current.profileSettingsQueryOptions().queryKey,
        exact: true,
      });
    }
  });
  const unsubscribe = host.addListener(sync);
  sync();
  host.on('status', sync);
  return {
    getSnapshot: () => client,
    getHydrationAllowed: () => hydrationAllowed,
    getReadySnapshot: () => (resolved ? client : undefined),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose: () => {
      if (disposed) {
        return;
      }
      disposed = true;
      signedOutOwner = null;
      unsubscribe();
      unsubscribeEnvironment?.();
      host.off('status', sync);
      client?.dispose();
      client = null;
      for (const listener of listeners) {
        listener();
      }
      listeners.clear();
    },
  };
}
import { createLoomClient, type LoomClient } from './client';
import { parseSessions, throwResponseError } from './fapi';
import { parseProfileSettings } from './profile-settings';
import { createClerkScope, sameScope } from './scope';
import type { LoomHydration, SessionScope } from './types';
import { resourceUserSnapshot, userSnapshot } from './user';
