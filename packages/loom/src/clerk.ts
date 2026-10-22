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
          verification?: { status: string | null } | null;
        }[];
        primaryEmailAddressId?: string | null;
        emailAddresses?: readonly {
          id: string;
          emailAddress: string;
          verification?: { status: string | null } | null;
        }[];
      }
    | null
    | undefined;
  session: { id: string } | null | undefined;
  addListener: (listener: () => void) => () => void;
  on: (event: 'status', listener: () => void) => void;
  off: (event: 'status', listener: () => void) => void;
  getFapiClient?: () => {
    request: (request: {
      method: string;
      path: string;
      sessionId: string;
      signal: AbortSignal;
      body?: BodyInit;
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
  let disposed = false;
  let seed = hydration;
  let hydrationAllowed = hydration !== undefined;
  let resolved = false;
  let profile: string | undefined;
  const listeners = new Set<() => void>();
  const sync = () => {
    if (disposed) {
      return;
    }
    const scope = scopeOf(host);
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
      if (profile !== nextProfile) {
        profile = nextProfile;
        void client?.invalidateUser().catch(() => {});
      }
      return;
    }
    profile = nextProfile;
    client?.dispose();
    client = null;
    if (scope) {
      const request = async (method: string, path: string, signal: AbortSignal) => {
        if (disposed || !sameScope(scope, scopeOf(host))) {
          throw new Error('Clerk identity changed.');
        }
        if (typeof host.getFapiClient !== 'function') {
          throw new Error('Clerk transport is unavailable. Use a Clerk host with transport support.');
        }
        const response = await host
          .getFapiClient()
          .request({ method, path, signal, sessionId: scope.sessionId, ...(method === 'POST' ? { body: '' } : {}) });
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
        hydration: seed && sameScope(seed.scope, scope) ? seed : undefined,
        readProfileSettings: async signal => parseProfileSettings(await request('GET', '/environment', signal)),
        readUser: async signal => parseUser(await request('GET', '/me', signal), scope.userId),
        transport: {
          read: async signal => parseSessions(await request('GET', '/me/sessions/active', signal)),
          revoke: async (id, signal) => {
            await request('POST', `/me/sessions/${encodeURIComponent(id)}/revoke`, signal);
          },
        },
      });
    }
    if (scope) {
      seed = undefined;
    }
    for (const listener of listeners) {
      listener();
    }
  };
  sync();
  const unsubscribe = host.addListener(sync);
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
      unsubscribe();
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
import { parseUser, resourceUserSnapshot } from './user';
