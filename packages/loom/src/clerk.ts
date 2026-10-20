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
  getFapiClient: () => {
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
  return {
    instanceKey: JSON.stringify([host.publishableKey, host.frontendApi, host.proxyUrl ?? '', host.domain]),
    userId: host.user.id,
    sessionId: host.session.id,
  };
}

function matches(a: SessionScope | null, b: SessionScope | null): boolean {
  return a?.instanceKey === b?.instanceKey && a?.userId === b?.userId && a?.sessionId === b?.sessionId;
}

export function bindClerk(host: ClerkSessionsHost) {
  let client: LoomClient | null = null;
  let disposed = false;
  const listeners = new Set<() => void>();
  const sync = () => {
    if (disposed) {
      return;
    }
    const scope = scopeOf(host);
    if (matches(scope, client?.scope ?? null)) {
      return;
    }
    client?.dispose();
    client = null;
    if (scope) {
      const request = async (method: string, path: string, signal: AbortSignal) => {
        if (disposed || !matches(scope, scopeOf(host))) {
          throw new Error('Clerk identity changed.');
        }
        const response = await host
          .getFapiClient()
          .request({ method, path, signal, sessionId: scope.sessionId, ...(method === 'POST' ? { body: '' } : {}) });
        if (disposed || !matches(scope, scopeOf(host))) {
          throw new Error('Clerk identity changed.');
        }
        if (!response.ok) {
          throwResponseError(response);
        }
        return response.payload;
      };
      client = createLoomClient({
        scope,
        transport: {
          read: async signal => parseSessions(await request('GET', '/me/sessions/active', signal)),
          revoke: async (id, signal) => {
            await request('POST', `/me/sessions/${encodeURIComponent(id)}/revoke`, signal);
          },
        },
      });
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
import type { SessionScope } from './types';
