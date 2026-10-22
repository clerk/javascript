import type { QueryObserverResult } from '@tanstack/query-core';
import { QueryClient, QueryObserver } from '@tanstack/query-core';

import { parseHydration, sessionSnapshots } from './hydration';
import type { ProfileActionOptions, ProfileActions } from './profile-actions-types';
import { unavailableProfileActions } from './profile-actions-unavailable';
import { profileSettingsSnapshot } from './profile-settings';
import type {
  EnterpriseConnection,
  LoomHydration,
  ProfileSettings,
  Sessions,
  SessionScope,
  SessionsTransport,
  UserNameInput,
  UserSnapshot,
} from './types';
import { userSnapshot } from './user';

type Options = {
  profileActions?: (owner: LoomClient, options: ProfileActionOptions) => ProfileActions;
  scope: SessionScope;
  transport?: SessionsTransport;
  readUser?: (signal: AbortSignal) => Promise<UserSnapshot>;
  updateName?: (input: UserNameInput) => Promise<UserSnapshot>;
  readProfileSettings?: (signal: AbortSignal) => Promise<ProfileSettings>;
  readEnterpriseConnections?: (signal: AbortSignal) => Promise<readonly EnterpriseConnection[]>;
  hydration?: unknown;
};

let nextOwnerId = 0;

export class LoomClient {
  readonly ownerId = ++nextOwnerId;
  readonly scope: SessionScope;
  readonly queryClient = new QueryClient();
  private disposed = false;
  private readonly makeProfileActions: Options['profileActions'];
  private actionRevision = 0;
  onDispose(listener: () => void) {
    this.assertLive();
    this.subscriptions.add(listener);
    return () => {
      this.subscriptions.delete(listener);
    };
  }

  private readonly actionListeners = new Set<() => void>();
  private profileWrites = 0;
  private profileNeedsRefresh = false;
  private profileWriteOverlap = false;

  subscribeActions = (listener: () => void) => {
    this.actionListeners.add(listener);
    return () => {
      this.actionListeners.delete(listener);
    };
  };

  getActionRevision = () => this.actionRevision;

  notifyActions() {
    this.actionRevision++;
    for (const listener of this.actionListeners) {
      listener();
    }
  }

  profileActions(options: ProfileActionOptions = {}): ProfileActions {
    return this.disposed
      ? unavailableProfileActions
      : (this.makeProfileActions?.(this, options) ?? unavailableProfileActions);
  }

  async mutateProfile(operation: () => Promise<unknown>): Promise<void> {
    this.assertLive();
    this.profileWriteOverlap ||= this.nameUpdateInFlight;
    this.profileWrites++;
    this.userRevision++;
    const queryKey = this.userQueryOptions().queryKey;
    try {
      await this.queryClient.cancelQueries({ queryKey, exact: true });
      this.assertLive();
      await operation();
      this.assertLive();
      this.profileNeedsRefresh = true;
    } finally {
      this.profileWrites--;
      if (!this.disposed && this.profileWrites === 0) {
        const reconcile = this.profileNeedsRefresh || this.deferredUserInvalidation;
        this.profileNeedsRefresh = false;
        if (!this.nameUpdateInFlight) {
          this.profileWriteOverlap = false;
        }
        this.deferredUserInvalidation = false;
        if (reconcile) {
          void this.invalidateUser().catch(() => {});
        }
        this.notifyActions();
      }
    }
  }

  private revision = 0;
  private readonly subscriptions = new Set<() => void>();
  private readonly mutations = new Set<AbortController>();
  private readonly transport: SessionsTransport | undefined;
  private readonly readUser: Options['readUser'];
  private readonly writeName: Options['updateName'];
  private userRevision = 0;
  private nameUpdateInFlight = false;
  private deferredUserInvalidation = false;
  private readonly readProfileSettings: Options['readProfileSettings'];
  private readonly readEnterpriseConnections: Options['readEnterpriseConnections'];

  constructor(options: Options) {
    this.makeProfileActions = options.profileActions;
    this.scope = Object.freeze({ ...options.scope });
    this.transport = options.transport;
    this.readUser = options.readUser;
    this.writeName = options.updateName;
    this.readProfileSettings = options.readProfileSettings;
    this.readEnterpriseConnections = options.readEnterpriseConnections;
    if (options.hydration !== undefined) {
      const state = parseHydration(options.hydration, this.scope);
      if (state.sessions) {
        this.queryClient.setQueryData(this.queryOptions().queryKey, state.sessions.data, {
          updatedAt: state.sessions.updatedAt,
        });
      }
      if (state.profileSettings) {
        this.queryClient.setQueryData(this.profileSettingsQueryOptions().queryKey, state.profileSettings.data, {
          updatedAt: state.profileSettings.updatedAt,
        });
      }
      if (state.user) {
        this.queryClient.setQueryData(this.userQueryOptions().queryKey, state.user.data, {
          updatedAt: state.user.updatedAt,
        });
      }
    }
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
    const user = this.queryClient.getQueryState<UserSnapshot>(this.userQueryOptions().queryKey);
    const settings = this.queryClient.getQueryState<ProfileSettings>(this.profileSettingsQueryOptions().queryKey);
    const state: LoomHydration = {
      version: 5,
      scope: this.scope,
      ...(settings?.status === 'success' && settings.data !== undefined
        ? { profileSettings: { data: settings.data, updatedAt: settings.dataUpdatedAt } }
        : {}),
      ...(sessions?.status === 'success' && sessions.data !== undefined
        ? { sessions: { data: sessions.data, updatedAt: sessions.dataUpdatedAt } }
        : {}),
      ...(user?.status === 'success' && user.data !== undefined
        ? { user: { data: user.data, updatedAt: user.dataUpdatedAt } }
        : {}),
    };
    return state.sessions || state.user || state.profileSettings ? parseHydration(state, this.scope) : undefined;
  }

  userQueryOptions() {
    return {
      queryKey: ['loom', 5, this.scope.instanceKey, this.scope.userId, this.scope.sessionId, 'user'] as const,
      staleTime: 30_000,
      gcTime: 300_000,
      retry: false as const,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      queryFn: async ({ signal }: { signal: AbortSignal }): Promise<UserSnapshot> => {
        this.assertLive();
        const revision = this.userRevision;
        if (!this.readUser) {
          throw new Error('Loom user transport is unavailable.');
        }
        const user = await this.readUser(signal);
        this.assertUserCurrent(revision);
        return userSnapshot(user, this.scope.userId);
      },
    };
  }

  async fetchUser(): Promise<UserSnapshot> {
    this.assertLive();
    const revision = this.userRevision;
    const user = await this.queryClient.fetchQuery(this.userQueryOptions());
    this.assertUserCurrent(revision);
    return user;
  }

  async prefetchUser(): Promise<void> {
    this.assertLive();
    await this.queryClient.prefetchQuery(this.userQueryOptions());
  }

  async refreshUser(): Promise<UserSnapshot> {
    this.assertLive();
    await this.queryClient.invalidateQueries({
      queryKey: this.userQueryOptions().queryKey,
      exact: true,
      refetchType: 'none',
    });
    return this.fetchUser();
  }

  async invalidateUser(): Promise<void> {
    this.assertLive();
    if (this.nameUpdateInFlight || this.profileWrites > 0) {
      this.deferredUserInvalidation = true;
      return;
    }
    this.userRevision++;
    const queryKey = this.userQueryOptions().queryKey;
    await this.queryClient.cancelQueries({ queryKey, exact: true });
    this.assertLive();
    await this.queryClient.invalidateQueries({ queryKey, exact: true });
  }

  get canUpdateName(): boolean {
    return this.writeName !== undefined && !this.disposed;
  }

  async updateName(input: UserNameInput): Promise<UserSnapshot> {
    this.assertLive();
    if (!this.writeName) {
      throw new Error('Loom name update is unavailable.');
    }
    if (this.nameUpdateInFlight) {
      throw new Error('Loom name update is already in progress.');
    }
    this.profileWriteOverlap ||= this.profileWrites > 0;
    this.nameUpdateInFlight = true;
    let failed = false;
    const queryKey = this.userQueryOptions().queryKey;
    try {
      this.userRevision++;
      await this.queryClient.cancelQueries({ queryKey, exact: true });
      this.assertLive();
      const user = userSnapshot(await this.writeName(input), this.scope.userId);
      this.assertLive();
      this.userRevision++;
      await this.queryClient.cancelQueries({ queryKey, exact: true });
      this.assertLive();
      if (!this.profileWriteOverlap) {
        this.queryClient.setQueryData<UserSnapshot>(queryKey, user);
      }
      return user;
    } catch (error) {
      failed = true;
      throw error;
    } finally {
      this.nameUpdateInFlight = false;
      const reconcile = ((failed && this.deferredUserInvalidation) || this.profileWriteOverlap) && !this.disposed;
      if (this.profileWrites === 0) {
        this.profileWriteOverlap = false;
      }
      this.deferredUserInvalidation = false;
      if (reconcile) {
        void this.invalidateUser().catch(() => {});
      }
    }
  }

  profileSettingsQueryOptions() {
    return {
      queryKey: [
        'loom',
        5,
        this.scope.instanceKey,
        this.scope.userId,
        this.scope.sessionId,
        'profile-settings',
      ] as const,
      staleTime: 30_000,
      gcTime: 300_000,
      retry: false as const,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      queryFn: async ({ signal }: { signal: AbortSignal }): Promise<ProfileSettings> => {
        this.assertLive();
        if (!this.readProfileSettings) {
          throw new Error('Loom profile settings transport is unavailable.');
        }
        const settings = await this.readProfileSettings(signal);
        this.assertLive();
        return profileSettingsSnapshot(settings);
      },
    };
  }

  get canReadEnterpriseConnections(): boolean {
    return this.readEnterpriseConnections !== undefined && !this.disposed;
  }

  enterpriseConnectionsQueryOptions() {
    return {
      queryKey: [
        'loom',
        5,
        this.scope.instanceKey,
        this.scope.userId,
        this.scope.sessionId,
        'enterprise-connections',
      ] as const,
      staleTime: 30_000,
      gcTime: 300_000,
      retry: false as const,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      queryFn: async ({ signal }: { signal: AbortSignal }): Promise<readonly EnterpriseConnection[]> => {
        this.assertLive();
        if (!this.readEnterpriseConnections) {
          throw new Error('Loom enterprise connection read is unavailable.');
        }
        const connections = await this.readEnterpriseConnections(signal);
        this.assertLive();
        return connections;
      },
    };
  }

  async fetchProfileSettings(): Promise<ProfileSettings> {
    this.assertLive();
    const settings = await this.queryClient.fetchQuery(this.profileSettingsQueryOptions());
    this.assertLive();
    return settings;
  }

  private assertUserCurrent(revision: number): void {
    this.assertLive();
    if (revision !== this.userRevision) {
      throw new Error('Loom user read was superseded by a profile update.');
    }
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.actionListeners.clear();
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
