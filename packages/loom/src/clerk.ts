import { createLoomClient, type LoomClient } from './client';
import { parseSessions, throwResponseError } from './fapi';
import { createClerkScope, sameScope } from './scope';
import type { LoomHydration, SessionScope } from './types';

export type ClerkSessionsHost = {
  loaded: boolean;
  publishableKey: string;
  frontendApi: string;
  proxyUrl: string | undefined;
  domain: string;
  user: { id: string } | null | undefined;
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
    if (sameScope(scope, client?.scope ?? null) && wasResolved === resolved) {
      return;
    }
    client?.dispose();
    client = null;
    if (scope) {
      const initial = seed && sameScope(seed.scope, scope) ? seed : undefined;
      const request = async (method: string, path: string, signal: AbortSignal) => {
        if (disposed || !sameScope(scope, scopeOf(host))) {
          throw new Error('Clerk identity changed.');
        }
        if (typeof host.getFapiClient !== 'function') {
          throw new Error('Clerk transport is unavailable. Use a Clerk host with transport support.');
        }
        const response = await host.getFapiClient().request({
          method,
          path,
          signal,
          sessionId: scope.sessionId,
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
        hydration: initial,
        transport: {
          read: async signal => parseSessions(await request('GET', '/me/sessions/active', signal)),
          revoke: async (id, signal) => {
            await request('POST', `/me/sessions/${encodeURIComponent(id)}/revoke`, signal);
          },
        },
      });
      seed = undefined;
    }
    for (const listener of listeners) {
      listener();
    }
  };
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
