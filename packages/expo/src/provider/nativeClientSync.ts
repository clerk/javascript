import type { ClientResource, SignedInSessionResource } from '@clerk/shared/types';

import { MemoryTokenCache } from '../cache/MemoryTokenCache';
import type { TokenCache } from '../cache/types';
import { CLERK_CLIENT_JWT_KEY } from '../constants';
import type { ClerkExpoNativeModule } from '../utils/native-module';

const CONFIGURE_TIMEOUT_MS = 3_000;
const IDLE_TIMEOUT_MS = 5_000;
const INVALIDATED_EVENT = 'clerkNativeClientInvalidated';

type FetchableClient = ClientResource & { fetch?: (options?: { fetchMaxTries?: number }) => Promise<ClientResource> };

export type SyncableClerk = {
  addListener: (listener: () => void) => () => void;
  client?: ClientResource | null;
  session?: SignedInSessionResource | null;
  setActive: (params: { session: SignedInSessionResource | null }) => Promise<void>;
  updateClient: (client: ClientResource, options?: { __internal_dangerouslySkipEmit?: boolean }) => void;
  handleUnauthenticated: (options?: { broadcast?: boolean }) => Promise<unknown>;
  __internal_reloadInitialResources?: () => Promise<void>;
  __internal_setActiveInProgress?: boolean;
};

/** A token cache whose client JWT writes are compare-and-set against the token the request used. */
export type ClientTokenCache = TokenCache & {
  saveClientToken: (token: string, requestToken: string | null) => Promise<void>;
};

type SingleFlight = { run: () => Promise<void>; current: () => Promise<void> | null };

type Engine = {
  settled: () => Promise<void>;
  pull: () => Promise<void>;
  refreshFailure: () => { error: unknown } | null;
};

const noop = () => undefined;

let configuration: { publishableKey: string; ready: Promise<boolean> } | null = null;
let activeEngine: Engine | null = null;

function warn(message: string, error?: unknown): void {
  if (__DEV__) {
    console.warn(`[ClerkExpo] ${message}`, error);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, error: () => Error): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(error()), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function singleFlight(task: () => Promise<void>): SingleFlight {
  let running: Promise<void> | null = null;
  let rerun = false;
  const run = (): Promise<void> => {
    if (running) {
      rerun = true;
      return running;
    }
    running = (async () => {
      let failure: { error: unknown } | null = null;
      try {
        do {
          rerun = false;
          try {
            await task();
            failure = null;
          } catch (error) {
            failure = { error };
          }
        } while (rerun);
      } finally {
        running = null;
      }
      if (failure) {
        throw failure.error;
      }
    })();
    return running;
  };
  return { run, current: () => running };
}

function defaultSession(client: ClientResource | null | undefined): SignedInSessionResource | null {
  const sessions = client?.signedInSessions ?? [];
  return sessions.find(session => session.id === client?.lastActiveSessionId) ?? sessions[0] ?? null;
}

function fingerprint(clerk: SyncableClerk): string {
  const client = clerk.client;
  const user = clerk.session?.user;
  return JSON.stringify([
    client?.id ?? null,
    client?.lastActiveSessionId ?? null,
    client?.signedInSessions.map(session => [session.id, session.status]) ?? [],
    user?.id ?? null,
    +(user?.updatedAt ?? 0),
  ]);
}

function configureOnce(native: ClerkExpoNativeModule, publishableKey: string, tokenCache: TokenCache) {
  if (configuration?.publishableKey !== publishableKey) {
    const ready = (async () => {
      const seed = (await tokenCache.getToken(CLERK_CLIENT_JWT_KEY)) ?? null;
      await native.configureNative(publishableKey, seed);
    })();
    configuration = {
      publishableKey,
      ready: withTimeout(ready, CONFIGURE_TIMEOUT_MS, () => new Error('Timed out configuring the native Clerk SDK.'))
        .then(() => true)
        .catch(error => {
          warn('Native client sync is disabled because the native Clerk SDK failed to configure.', error);
          return false;
        }),
    };
  }
  return configuration.ready;
}

/**
 * Shares one device token, owned by native storage, between clerk-js and the native Clerk SDK, and
 * keeps both clients current by refetching on a payload-free "client changed" signal in each direction.
 */
export function createNativeClientSync(
  native: ClerkExpoNativeModule,
  publishableKey: string,
  getUserTokenCache: () => TokenCache | undefined,
) {
  const fallback = () => getUserTokenCache() ?? MemoryTokenCache;
  const ready = () => configureOnce(native, publishableKey, fallback());
  let mirroredToken: string | null = null;
  let lastFingerprint: string | undefined;
  let refreshFailure: { error: unknown } | null = null;

  const mirror = (token: string | null) => {
    if (token && token !== mirroredToken) {
      mirroredToken = token;
      void Promise.resolve(fallback().saveToken(CLERK_CLIENT_JWT_KEY, token)).catch(noop);
    }
  };

  const setDeviceToken = (token: string | null, expected: string | null) =>
    native.setDeviceToken(token, expected).catch(error => {
      warn('Failed to update the native device token.', error);
      return false;
    });

  const tokenCache: ClientTokenCache = {
    getToken: async key => {
      if (key !== CLERK_CLIENT_JWT_KEY || !(await ready())) {
        return fallback().getToken(key);
      }
      return native.getDeviceToken().catch(error => {
        warn('Failed to read the native device token.', error);
        return fallback().getToken(key);
      });
    },
    saveToken: async (key, token) => {
      if (key !== CLERK_CLIENT_JWT_KEY || !(await ready())) {
        return fallback().saveToken(key, token);
      }
      await tokenCache.saveClientToken(token, await native.getDeviceToken().catch(() => null));
    },
    clearToken: key => fallback().clearToken?.(key),
    saveClientToken: async (token, requestToken) => {
      if (!(await ready())) {
        return fallback().saveToken(CLERK_CLIENT_JWT_KEY, token);
      }
      const didSet = token === requestToken || (await setDeviceToken(token, requestToken));
      mirror(didSet ? token : await native.getDeviceToken().catch(() => null));
    },
  };

  const attach = (clerk: SyncableClerk): (() => void) => {
    let reconciling: Promise<void> | null = null;

    // Refetches the JS client with the shared device token and follows native's active session.
    const pull = async () => {
      const client = clerk.client as FetchableClient | null | undefined;
      if (typeof client?.fetch === 'function') {
        clerk.updateClient(await client.fetch({ fetchMaxTries: 1 }));
      } else {
        await clerk.__internal_reloadInitialResources?.();
      }
      const target = defaultSession(clerk.client);
      if (target && clerk.session?.id !== target.id && !reconciling && !clerk.__internal_setActiveInProgress) {
        await clerk.setActive({ session: target });
      }
    };

    const fromNative = singleFlight(async () => {
      if (await ready()) {
        await pull();
        await reconciling;
        lastFingerprint = fingerprint(clerk);
      }
    });

    const toNative = singleFlight(async () => {
      // Let an in-flight native pull settle first so its own emissions are not echoed back.
      await fromNative.current()?.catch(noop);
      const next = fingerprint(clerk);
      if (next === lastFingerprint || !(await ready())) {
        return;
      }
      lastFingerprint = next;
      try {
        await native.refreshClient();
        refreshFailure = null;
      } catch (error) {
        lastFingerprint = undefined;
        refreshFailure = { error };
        throw error;
      }
    });

    const originalUpdateClient = clerk.updateClient;
    const updateClient: SyncableClerk['updateClient'] = (client, options) => {
      const sessionId = clerk.session?.id;
      const fallbackSession = defaultSession(client);
      const wasRemoved = !!sessionId && !client.signedInSessions.some(session => session.id === sessionId);
      if (!fallbackSession || !(wasRemoved || reconciling)) {
        return originalUpdateClient(client, options);
      }
      // clerk-js would emit a transient signed-out state before another session is activated.
      originalUpdateClient(client, { __internal_dangerouslySkipEmit: true });
      if (reconciling || clerk.__internal_setActiveInProgress) {
        return;
      }
      reconciling = clerk
        .setActive({ session: fallbackSession })
        .catch(error => {
          warn('Failed to activate the remaining session.', error);
          originalUpdateClient(client, options);
        })
        .finally(() => {
          reconciling = null;
        });
    };

    const originalHandleUnauthenticated = clerk.handleUnauthenticated;
    let isHandlingUnauthenticated = false;
    const handleUnauthenticated: SyncableClerk['handleUnauthenticated'] = async options => {
      if (isHandlingUnauthenticated) {
        return;
      }
      isHandlingUnauthenticated = true;
      try {
        if (await ready()) {
          // Native may have moved the client to another session that JS has not seen yet.
          const pendingReconcile = reconciling;
          await pull();
          // A reconcile that predates this call may be the request that got the 401, so it is not awaited.
          if (reconciling !== pendingReconcile) {
            await reconciling;
          }
          if (clerk.session || reconciling) {
            return;
          }
        }
      } catch (error) {
        warn('Failed to refresh the client from native after an unauthenticated response.', error);
      } finally {
        isHandlingUnauthenticated = false;
      }
      return originalHandleUnauthenticated(options);
    };

    clerk.updateClient = updateClient;
    clerk.handleUnauthenticated = handleUnauthenticated;
    const removeClerkListener = clerk.addListener(
      () => void toNative.run().catch(error => warn('Failed to refresh the native client.', error)),
    );
    const subscription = native.addListener?.(
      INVALIDATED_EVENT,
      () => void fromNative.run().catch(error => warn('Failed to refresh the client from native.', error)),
    );

    const engine: Engine = {
      settled: async () => {
        while (toNative.current() || fromNative.current()) {
          await Promise.all([toNative.current()?.catch(noop), fromNative.current()?.catch(noop)]);
        }
      },
      pull: fromNative.run,
      refreshFailure: () => refreshFailure,
    };
    activeEngine = engine;

    return () => {
      removeClerkListener();
      subscription?.remove();
      if (clerk.updateClient === updateClient) {
        clerk.updateClient = originalUpdateClient;
      }
      if (clerk.handleUnauthenticated === handleUnauthenticated) {
        clerk.handleUnauthenticated = originalHandleUnauthenticated;
      }
      if (activeEngine === engine) {
        activeEngine = null;
      }
    };
  };

  return { tokenCache, attach };
}

/**
 * Resolves once pending JS→native and native→JS syncs have settled. Rejects with the latest native
 * refresh failure until a later refresh succeeds, or with `environment_unavailable` after a timeout.
 */
export async function idle(): Promise<void> {
  const engine = activeEngine;
  if (!engine) {
    return;
  }
  await withTimeout(engine.settled(), IDLE_TIMEOUT_MS, () =>
    Object.assign(new Error('Timed out waiting for the native Clerk client to synchronize.'), {
      code: 'environment_unavailable' as const,
    }),
  );
  const failure = engine.refreshFailure();
  if (failure) {
    throw failure.error;
  }
}

/** Refetches the JS client after a native operation and resolves once it has been applied. */
export function pullFromNative(): Promise<void> {
  return activeEngine?.pull() ?? Promise.resolve();
}
