import type { FakeClerkServer, FakeServerClientJSON, FapiResponse } from './fakeServer';

export type NativeClientChange = {
  client: boolean;
  deviceToken: boolean;
};

export type NativeClientChangeListener = (change: NativeClientChange, origin: NativeChangeOrigin) => void;

/** `native` for changes the native SDK made on its own, `js` for changes JS asked native to make. */
export type NativeChangeOrigin = { kind: 'native' } | { kind: 'js'; tag: string | null };

function sameClient(a: FakeServerClientJSON | null, b: FakeServerClientJSON | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * The native Clerk SDK: it persists its own device token (keychain / keystore), keeps its own view of
 * the client, and notifies listeners when either changes. The native module surface that exposes it to
 * JS is engine specific and lives in the adapter.
 */
export class FakeNativeClerk {
  token: string | null;
  client: FakeServerClientJSON | null = null;
  isConfigured = false;
  /** Times native fetched its client from the Frontend API. */
  clientRefreshCount = 0;
  #listeners = new Set<NativeClientChangeListener>();
  #heldChanges: Array<[NativeClientChange, NativeChangeOrigin]> | null = null;
  #startupGate: Promise<void> | null = null;
  #nextRefreshError: Error | null = null;

  constructor(
    private readonly server: FakeClerkServer,
    initialToken: string | null = null,
  ) {
    this.token = initialToken;
  }

  get activeSessionId(): string | null {
    return this.client?.lastActiveSessionId ?? null;
  }

  get sessionIds(): string[] {
    return this.client?.sessions.map(session => session.id) ?? [];
  }

  onChange(listener: NativeClientChangeListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /** Native keeps its change notifications queued until `releaseChangeNotifications`. */
  holdChangeNotifications(): void {
    this.#heldChanges ??= [];
  }

  releaseChangeNotifications(): void {
    const held = this.#heldChanges ?? [];
    this.#heldChanges = null;
    for (const [change, origin] of held) {
      this.emitChange(change, origin);
    }
  }

  /** Native stays in its startup phase until the returned release function is called. */
  delayStartup(): () => void {
    let release!: () => void;
    this.#startupGate = new Promise(resolve => {
      release = resolve;
    });
    return release;
  }

  failNextClientRefresh(error: Error): void {
    this.#nextRefreshError = error;
  }

  // Primitives used by engine adapters.

  async waitForStartup(): Promise<void> {
    await this.#startupGate;
  }

  async refreshClient(): Promise<void> {
    this.clientRefreshCount += 1;
    if (this.#nextRefreshError) {
      const error = this.#nextRefreshError;
      this.#nextRefreshError = null;
      throw error;
    }
    this.#apply(await this.server.getClient('native', this.token));
  }

  async adoptToken(token: string | null): Promise<void> {
    this.token = token;
    await this.refreshClient();
  }

  emitChange(change: NativeClientChange, origin: NativeChangeOrigin): void {
    if (this.#heldChanges) {
      this.#heldChanges.push([change, origin]);
      return;
    }
    for (const listener of this.#listeners) {
      listener(change, origin);
    }
  }

  // Native user actions (native UI components, native-only flows).

  async signIn(userId: string): Promise<string> {
    const response = await this.#observe(() => this.server.signIn('native', this.token, userId));
    return response.sessionId;
  }

  async setActiveSession(sessionId: string): Promise<void> {
    await this.#observe(() => this.server.touchSession('native', this.token, sessionId));
  }

  async signOutSession(sessionId: string): Promise<void> {
    await this.#observe(() => this.server.removeSession('native', this.token, sessionId));
  }

  async signOut(): Promise<void> {
    await this.#observe(() => this.server.removeAllSessions('native', this.token));
  }

  async rotateDeviceToken(): Promise<void> {
    if (this.token) {
      this.server.rotateTokenOnNextResponse(this.token);
    }
    await this.#observe(() => this.server.getClient('native', this.token));
  }

  /** Native ends up on a brand new client with no sessions, e.g. after losing its keychain entry. */
  async switchToForeignSessionlessClient(): Promise<void> {
    await this.#observe(() => this.server.createSessionlessClient('native'));
  }

  #apply(response: FapiResponse): void {
    if (response.token) {
      this.token = response.token;
    }
    this.client = response.client;
  }

  async #observe<T extends FapiResponse>(request: () => Promise<T>): Promise<T> {
    const previousToken = this.token;
    const previousClient = this.client;
    const response = await request();
    this.#apply(response);
    const change = {
      client: !sameClient(previousClient, this.client),
      deviceToken: previousToken !== this.token,
    };
    if (change.client || change.deviceToken) {
      this.emitChange(change, { kind: 'native' });
    }
    return response;
  }
}
