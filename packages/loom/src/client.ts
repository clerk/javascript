import type { QueryObserverResult } from '@tanstack/query-core';
import { QueryClient, QueryObserver } from '@tanstack/query-core';

import { parseHydration, sessionSnapshots } from './hydration';
import type { LoomHydration, Sessions, SessionScope, SessionsTransport } from './types';

type Options = {
  scope: SessionScope;
  transport?: SessionsTransport;
  hydration?: unknown;
};

let nextOwnerId = 0;

export class LoomClient {
  readonly ownerId = ++nextOwnerId;
  readonly scope: SessionScope;
  readonly queryClient = new QueryClient();
  private disposed = false;
  private revision = 0;
  private readonly subscriptions = new Set<() => void>();
  private readonly mutations = new Set<AbortController>();
  private readonly transport: SessionsTransport | undefined;

  constructor(options: Options) {
    this.scope = Object.freeze({ ...options.scope });
    this.transport = options.transport;
    if (options.hydration !== undefined) {
      const state = parseHydration(options.hydration, this.scope);
      if (state.sessions) {
        this.queryClient.setQueryData(this.queryOptions().queryKey, state.sessions.data, {
          updatedAt: state.sessions.updatedAt,
        });
      }
    }
  }

  onDispose(listener: () => void) {
    this.assertLive();
    this.subscriptions.add(listener);
    return () => {
      this.subscriptions.delete(listener);
    };
  }

  queryOptions() {
    return {
      queryKey: ['loom', 5, this.scope.instanceKey, this.scope.userId, this.scope.sessionId, 'sessions'] as const,
      staleTime: 30_000,
      gcTime: 300_000,
      retry: false as const,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      queryFn: async ({ signal }: { signal: AbortSignal }): Promise<Sessions> => {
        this.assertLive();
        const revision = this.revision;
        if (!this.transport) {
          throw new Error('Loom sessions transport is unavailable.');
        }
        const sessions = await this.transport.read(signal);
        this.assertCurrent(revision);
        return sessionSnapshots(sessions);
      },
    };
  }

  async fetch(): Promise<Sessions> {
    this.assertLive();
    const revision = this.revision;
    const data = await this.queryClient.fetchQuery(this.queryOptions());
    this.assertCurrent(revision);
    return data;
  }

  async prefetch(): Promise<void> {
    this.assertLive();
    await this.queryClient.prefetchQuery(this.queryOptions());
  }

  async refresh(): Promise<Sessions> {
    this.assertLive();
    await this.queryClient.invalidateQueries({ queryKey: this.queryOptions().queryKey, refetchType: 'none' });
    return this.fetch();
  }

  getSnapshot() {
    return this.queryClient.getQueryState<Sessions, Error>(this.queryOptions().queryKey);
  }

  subscribe(listener: (result: QueryObserverResult<Sessions, Error>) => void): () => void {
    this.assertLive();
    const observer = new QueryObserver(this.queryClient, this.queryOptions());
    const stop = observer.subscribe(listener);
    const unsubscribe = () => {
      stop();
      this.subscriptions.delete(unsubscribe);
    };
    this.subscriptions.add(unsubscribe);
    return unsubscribe;
  }

  async revoke(id: string): Promise<void> {
    this.assertLive();
    const target = this.getSnapshot()?.data?.find(item => item.id === id);
    if (id === this.scope.sessionId || !target || (target.status !== 'active' && target.status !== 'pending')) {
      throw new Error('This device is unavailable.');
    }
    const controller = new AbortController();
    this.mutations.add(controller);
    try {
      if (!this.transport) {
        throw new Error('Loom sessions transport is unavailable.');
      }
      await this.transport.revoke(id, controller.signal);
      this.assertLive();
      this.revision++;
      const queryKey = this.queryOptions().queryKey;
      await this.queryClient.cancelQueries({ queryKey });
      this.assertLive();
      this.queryClient.setQueryData<Sessions>(queryKey, current => current?.filter(item => item.id !== id));
      void this.queryClient.invalidateQueries({ queryKey });
    } finally {
      this.mutations.delete(controller);
    }
  }

  dehydrate(): LoomHydration | undefined {
    this.assertLive();
    const sessions = this.getSnapshot();
    if (sessions?.status !== 'success' || sessions.data === undefined) {
      return undefined;
    }
    return parseHydration(
      {
        version: 5,
        scope: this.scope,
        sessions: { data: sessions.data, updatedAt: sessions.dataUpdatedAt },
      },
      this.scope,
    );
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    for (const unsubscribe of this.subscriptions) {
      unsubscribe();
    }
    for (const controller of this.mutations) {
      controller.abort();
    }
    this.mutations.clear();
    this.queryClient.clear();
  }

  assertLive(): void {
    if (this.disposed) {
      throw new Error('Loom client is disposed.');
    }
  }

  private assertCurrent(revision: number): void {
    this.assertLive();
    if (revision !== this.revision) {
      throw new Error('Loom read was superseded by a mutation.');
    }
  }
}

export function createLoomClient(options: Options): LoomClient {
  return new LoomClient(options);
}
