import type { TokenCache } from '../../../cache/types';
import { CLERK_CLIENT_JWT_KEY } from '../../../constants';
import type { ClientTokenCache } from '../../nativeClientSync';
import type { FakeClerkServer, FakeServerClientJSON, FapiResponse } from './fakeServer';

export type FakeSessionResource = {
  id: string;
  status: 'active';
  activityVersion: number;
  updatedAt: Date;
  user: { id: string; profileVersion: number; updatedAt: Date };
};

export type JsEmission = {
  sessionId: string | null;
  signedInSessionIds: string[];
};

type ListenerCallback = (resources: { client: FakeClientResource; session: FakeSessionResource | null }) => void;
type StatusListener = (status: string) => void;

function toSessionResource(session: FakeServerClientJSON['sessions'][number]): FakeSessionResource {
  return {
    id: session.id,
    status: 'active',
    activityVersion: session.activityVersion,
    updatedAt: new Date(session.profileVersion + session.activityVersion),
    user: { id: session.userId, profileVersion: session.profileVersion, updatedAt: new Date(session.profileVersion) },
  };
}

/**
 * Mirrors clerk-js' `Client` resource: `fetch` mutates the instance in place and returns it.
 */
export class FakeClientResource {
  id = '';
  sessions: FakeSessionResource[] = [];
  lastActiveSessionId: string | null = null;
  signIn = { id: '', status: null as string | null, createdSessionId: null as string | null };

  constructor(private readonly clerk: FakeClerk) {}

  get signedInSessions(): FakeSessionResource[] {
    return this.sessions.filter(session => session.status === 'active');
  }

  fetch = async (_options?: { fetchMaxTries?: number }): Promise<FakeClientResource> => {
    const response = await this.clerk.fapi(token => this.clerk.server.getClient('js', token));
    return this.fromJSON(response.client);
  };

  fromJSON(data: FakeServerClientJSON | null): this {
    this.id = data?.id ?? '';
    this.sessions = data?.sessions.map(toSessionResource) ?? [];
    this.lastActiveSessionId = data?.lastActiveSessionId ?? null;
    return this;
  }

  __internal_toSnapshot(): FakeServerClientJSON {
    return {
      id: this.id,
      lastActiveSessionId: this.lastActiveSessionId,
      sessions: this.sessions.map(session => ({
        id: session.id,
        userId: session.user.id,
        profileVersion: session.user.profileVersion,
        activityVersion: session.activityVersion,
      })),
    };
  }
}

/**
 * Stand-in for the clerk-js instance returned by `getClerkInstance`, with the same surface the existing
 * ClerkProvider tests mock. It talks to the fake Frontend API through the token cache it was built with,
 * mirroring the `__internal_onBeforeRequest` / `__internal_onAfterResponse` hooks in `createClerkInstance`,
 * including the compare-and-set write against the token the request used.
 */
export class FakeClerk {
  loaded = false;
  status = 'loading';
  client: FakeClientResource | undefined = undefined;
  session: FakeSessionResource | null = null;
  __internal_setActiveInProgress = false;
  /** Every state emitted to Clerk listeners (what `useAuth` consumers observe). */
  readonly emissions: JsEmission[] = [];
  tokenCache: (TokenCache & Partial<ClientTokenCache>) | undefined;
  #listeners: ListenerCallback[] = [];
  #statusListeners = new Set<StatusListener>();
  #onLoadedListeners: Array<() => void> = [];
  #loading: Promise<void> | null = null;

  constructor(readonly server: FakeClerkServer) {}

  async fapi<T extends FapiResponse>(request: (token: string | null) => Promise<T>): Promise<T> {
    const token = (await this.tokenCache?.getToken(CLERK_CLIENT_JWT_KEY)) ?? null;
    const response = await request(token);
    if (response.token) {
      await (this.tokenCache?.saveClientToken
        ? this.tokenCache.saveClientToken(response.token, token)
        : this.tokenCache?.saveToken(CLERK_CLIENT_JWT_KEY, response.token));
    }
    return response;
  }

  async currentDeviceToken(): Promise<string | null> {
    return (await this.tokenCache?.getToken(CLERK_CLIENT_JWT_KEY)) ?? null;
  }

  load = (): Promise<void> => {
    this.#loading ??= (async () => {
      const client = await new FakeClientResource(this).fetch();
      this.updateClient(client);
      this.loaded = true;
      this.status = 'ready';
      for (const listener of [...this.#statusListeners]) {
        listener('ready');
      }
      for (const listener of this.#onLoadedListeners.splice(0)) {
        listener();
      }
    })();
    return this.#loading;
  };

  addListener = (listener: ListenerCallback, options?: { skipInitialEmit?: boolean }): (() => void) => {
    this.#listeners.push(listener);
    if (this.client && !options?.skipInitialEmit) {
      listener({ client: this.client, session: this.session });
    }
    return () => {
      this.#listeners = this.#listeners.filter(candidate => candidate !== listener);
    };
  };

  addOnLoaded = (listener: () => void): void => {
    if (this.loaded) {
      listener();
      return;
    }
    this.#onLoadedListeners.push(listener);
  };

  on = (event: 'status', listener: StatusListener): void => {
    if (event === 'status') {
      this.#statusListeners.add(listener);
    }
  };

  off = (event: 'status', listener: StatusListener): void => {
    if (event === 'status') {
      this.#statusListeners.delete(listener);
    }
  };

  updateClient = (newClient: FakeClientResource, options?: { __internal_dangerouslySkipEmit?: boolean }): void => {
    if (!this.client) {
      this.session = this.#defaultSession(newClient);
    }
    this.client = newClient;
    if (this.session) {
      const sessionId = this.session.id;
      this.session = newClient.signedInSessions.find(session => session.id === sessionId) ?? null;
    }
    if (!options?.__internal_dangerouslySkipEmit) {
      this.#emit();
    }
  };

  setActive = async ({ session }: { session: FakeSessionResource | string | null }): Promise<void> => {
    this.__internal_setActiveInProgress = true;
    try {
      const sessionId = typeof session === 'string' ? session : (session?.id ?? null);
      if (sessionId && this.client) {
        const response = await this.fapi(token => this.server.touchSession('js', token, sessionId));
        this.#applyPiggybackedClient(response);
      }
      this.session = sessionId ? (this.client?.signedInSessions.find(s => s.id === sessionId) ?? null) : null;
      this.#emit();
    } finally {
      this.__internal_setActiveInProgress = false;
    }
  };

  handleUnauthenticated = async (_options?: { broadcast?: boolean }): Promise<unknown> => {
    if (!this.client || !this.session) {
      return;
    }
    const newClient = await this.client.fetch();
    this.updateClient(newClient);
    if (this.session) {
      return;
    }
    return this.setActive({ session: null });
  };

  __internal_reloadInitialResources = async (): Promise<void> => {
    const client = this.client ?? new FakeClientResource(this);
    await client.fetch({ fetchMaxTries: 1 });
    this.updateClient(client);
    this.#emit();
  };

  // JS user actions.

  async signIn(userId: string): Promise<string> {
    const response = await this.fapi(token => this.server.signIn('js', token, userId));
    this.#applyPiggybackedClient(response);
    await this.setActive({ session: response.sessionId });
    return response.sessionId;
  }

  async signOut(): Promise<void> {
    const response = await this.fapi(token => this.server.removeAllSessions('js', token));
    this.#applyPiggybackedClient(response);
    await this.setActive({ session: null });
  }

  async updateProfile(): Promise<void> {
    const sessionId = this.session?.id;
    if (!sessionId) {
      throw new Error('updateProfile requires an active session');
    }
    const response = await this.fapi(token => this.server.updateUser('js', token, sessionId));
    if (response.status === 401) {
      await this.handleUnauthenticated();
      return;
    }
    this.#applyPiggybackedClient(response);
  }

  /** A session token request; a 401 goes through `handleUnauthenticated` like the clerk-js fetcher. */
  async getSessionToken(): Promise<boolean> {
    const sessionId = this.session?.id;
    if (!sessionId) {
      return false;
    }
    const response = await this.fapi(token => this.server.createSessionToken('js', token, sessionId));
    if (response.status === 401) {
      await this.handleUnauthenticated();
      return false;
    }
    this.#applyPiggybackedClient(response);
    return true;
  }

  #applyPiggybackedClient(response: FapiResponse): void {
    if (response.status !== 200) {
      return;
    }
    const client = this.client ?? new FakeClientResource(this);
    this.updateClient(client.fromJSON(response.client));
  }

  #defaultSession(client: FakeClientResource): FakeSessionResource | null {
    return (
      client.signedInSessions.find(session => session.id === client.lastActiveSessionId) ??
      client.signedInSessions[0] ??
      null
    );
  }

  #emit(): void {
    if (!this.client) {
      return;
    }
    this.emissions.push({
      sessionId: this.session?.id ?? null,
      signedInSessionIds: this.client.signedInSessions.map(session => session.id),
    });
    for (const listener of [...this.#listeners]) {
      listener({ client: this.client, session: this.session });
    }
  }
}
