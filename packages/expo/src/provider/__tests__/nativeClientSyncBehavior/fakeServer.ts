export type FakeServerSessionJSON = {
  id: string;
  userId: string;
  profileVersion: number;
  /** Bumped by session activity such as minting a session token. */
  activityVersion: number;
};

export type FakeServerClientJSON = {
  id: string;
  sessions: FakeServerSessionJSON[];
  lastActiveSessionId: string | null;
};

export type FapiCaller = 'js' | 'native';

export type FapiResponse = {
  status: 200 | 401;
  client: FakeServerClientJSON | null;
  /** The device token the response hands back, like the `authorization` response header. */
  token: string | null;
};

export type FapiRequestLogEntry = {
  caller: FapiCaller;
  operation: string;
  token: string | null;
};

export type HeldResponse = {
  handled: Promise<void>;
  release: () => void;
};

type ResponseHold = { caller: FapiCaller; operation: string; handled: () => void; released: Promise<void> };

function networkRoundTrip(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function cloneClient(client: FakeServerClientJSON): FakeServerClientJSON {
  return {
    id: client.id,
    lastActiveSessionId: client.lastActiveSessionId,
    sessions: client.sessions.map(session => ({ ...session })),
  };
}

/**
 * A single Frontend API shared by the JS and native SDKs. Clients are keyed by device token, and
 * both SDKs only ever see server state through these requests. A device token is a JWT whose payload
 * names its client. Rotating a token retires the previous one, and like the real Frontend API a request
 * that carries a retired token is answered as a brand new client with no sessions.
 */
export class FakeClerkServer {
  readonly requests: FapiRequestLogEntry[] = [];
  #clients = new Map<string, FakeServerClientJSON>();
  #clientIdByToken = new Map<string, string>();
  #retiredTokens = new Set<string>();
  #pendingRotations = new Map<string, number>();
  #responseHolds: ResponseHold[] = [];
  #sequence = 0;
  #rotations = 0;

  #nextId(prefix: string): string {
    this.#sequence += 1;
    return `${prefix}_${this.#sequence}`;
  }

  #clientFor(token: string | null): FakeServerClientJSON | null {
    if (!token) {
      return null;
    }
    const clientId = this.#clientIdByToken.get(token);
    return clientId ? (this.#clients.get(clientId) ?? null) : null;
  }

  #mintToken(clientId: string): string {
    this.#rotations += 1;
    const payload = base64Url(JSON.stringify({ id: clientId, rotating_token: String(this.#rotations) }));
    const token = `header.${payload}.signature`;
    this.#clientIdByToken.set(token, clientId);
    return token;
  }

  #createClient(): { client: FakeServerClientJSON; token: string } {
    const client: FakeServerClientJSON = { id: this.#nextId('client'), sessions: [], lastActiveSessionId: null };
    this.#clients.set(client.id, client);
    return { client, token: this.#mintToken(client.id) };
  }

  #authenticate(token: string | null): { client: FakeServerClientJSON | null; token: string | null } {
    if (token && this.#retiredTokens.has(token)) {
      return this.#createClient();
    }
    return { client: this.#clientFor(token), token };
  }

  #respond(token: string | null, client: FakeServerClientJSON | null, status: 200 | 401 = 200): FapiResponse {
    let responseToken = client ? token : null;
    const pendingRotations = client ? (this.#pendingRotations.get(client.id) ?? 0) : 0;
    if (client && pendingRotations > 0) {
      this.#pendingRotations.set(client.id, pendingRotations - 1);
      if (token) {
        this.#clientIdByToken.delete(token);
        this.#retiredTokens.add(token);
      }
      responseToken = this.#mintToken(client.id);
    }
    return { status, client: client ? cloneClient(client) : null, token: responseToken };
  }

  async #send<T extends FapiResponse>(
    caller: FapiCaller,
    operation: string,
    token: string | null,
    handle: () => T,
  ): Promise<T> {
    this.requests.push({ caller, operation, token });
    await networkRoundTrip();
    const response = handle();
    const holdIndex = this.#responseHolds.findIndex(hold => hold.caller === caller && hold.operation === operation);
    if (holdIndex >= 0) {
      const [hold] = this.#responseHolds.splice(holdIndex, 1);
      hold.handled();
      await hold.released;
    }
    return response;
  }

  holdNextResponse(caller: FapiCaller, operation: string): HeldResponse {
    let handled!: () => void;
    let release!: () => void;
    const hold: ResponseHold = {
      caller,
      operation,
      handled: () => handled(),
      released: new Promise(resolve => {
        release = resolve;
      }),
    };
    this.#responseHolds.push(hold);
    return {
      handled: new Promise(resolve => {
        handled = resolve;
      }),
      release,
    };
  }

  seedClient({ users = [], activeUser }: { users?: string[]; activeUser?: string } = {}): {
    token: string;
    clientId: string;
    sessionIds: Record<string, string>;
  } {
    const { client, token } = this.#createClient();
    const sessionIds: Record<string, string> = {};
    for (const userId of users) {
      const session = { id: this.#nextId('sess'), userId, profileVersion: 0, activityVersion: 0 };
      client.sessions.push(session);
      sessionIds[userId] = session.id;
    }
    const activeUserId = activeUser ?? users[0];
    client.lastActiveSessionId = activeUserId ? sessionIds[activeUserId] : null;
    return { token, clientId: client.id, sessionIds };
  }

  rotateTokenOnNextResponse(token: string): void {
    const client = this.#clientFor(token);
    if (client) {
      this.#pendingRotations.set(client.id, (this.#pendingRotations.get(client.id) ?? 0) + 1);
    }
  }

  inspectClient(token: string | null): FakeServerClientJSON | null {
    const client = this.#clientFor(token);
    return client ? cloneClient(client) : null;
  }

  clientIdForToken(token: string | null): string | null {
    return this.#clientFor(token)?.id ?? null;
  }

  requestCount(caller: FapiCaller, operation?: string): number {
    return this.requests.filter(request => request.caller === caller && (!operation || request.operation === operation))
      .length;
  }

  getClient(caller: FapiCaller, token: string | null): Promise<FapiResponse> {
    return this.#send(caller, 'GET /client', token, () => {
      const auth = this.#authenticate(token);
      return this.#respond(auth.token, auth.client);
    });
  }

  createSessionlessClient(caller: FapiCaller): Promise<FapiResponse> {
    return this.#send(caller, 'POST /client', null, () => {
      const { client, token } = this.#createClient();
      return this.#respond(token, client);
    });
  }

  signIn(caller: FapiCaller, token: string | null, userId: string): Promise<FapiResponse & { sessionId: string }> {
    return this.#send(caller, 'POST /client/sign_ins', token, () => {
      const auth = this.#authenticate(token);
      const { client, token: responseToken } = auth.client
        ? { client: auth.client, token: auth.token }
        : this.#createClient();
      const session = { id: this.#nextId('sess'), userId, profileVersion: 0, activityVersion: 0 };
      client.sessions.push(session);
      client.lastActiveSessionId = session.id;
      return { ...this.#respond(responseToken, client), sessionId: session.id };
    });
  }

  touchSession(caller: FapiCaller, token: string | null, sessionId: string): Promise<FapiResponse> {
    return this.#send(caller, 'POST /client/sessions/:id/touch', token, () => {
      const { client, token: clientToken } = this.#authenticate(token);
      if (!client?.sessions.some(session => session.id === sessionId)) {
        return this.#respond(clientToken, client, 401);
      }
      client.lastActiveSessionId = sessionId;
      return this.#respond(clientToken, client);
    });
  }

  removeSession(caller: FapiCaller, token: string | null, sessionId: string): Promise<FapiResponse> {
    return this.#send(caller, 'POST /client/sessions/:id/remove', token, () => {
      const { client, token: clientToken } = this.#authenticate(token);
      if (!client) {
        return this.#respond(clientToken, null, 401);
      }
      client.sessions = client.sessions.filter(session => session.id !== sessionId);
      if (client.lastActiveSessionId === sessionId) {
        client.lastActiveSessionId = client.sessions[0]?.id ?? null;
      }
      return this.#respond(clientToken, client);
    });
  }

  removeAllSessions(caller: FapiCaller, token: string | null): Promise<FapiResponse> {
    return this.#send(caller, 'DELETE /client/sessions', token, () => {
      const { client, token: clientToken } = this.#authenticate(token);
      if (client) {
        client.sessions = [];
        client.lastActiveSessionId = null;
      }
      return this.#respond(clientToken, client);
    });
  }

  createSessionToken(caller: FapiCaller, token: string | null, sessionId: string): Promise<FapiResponse> {
    return this.#send(caller, 'POST /client/sessions/:id/tokens', token, () => {
      const { client, token: clientToken } = this.#authenticate(token);
      const session = client?.sessions.find(candidate => candidate.id === sessionId);
      if (session) {
        session.activityVersion += 1;
      }
      return this.#respond(clientToken, client, session ? 200 : 401);
    });
  }

  updateUser(caller: FapiCaller, token: string | null, sessionId: string): Promise<FapiResponse> {
    return this.#send(caller, 'PATCH /me', token, () => {
      const { client, token: clientToken } = this.#authenticate(token);
      const session = client?.sessions.find(candidate => candidate.id === sessionId);
      if (!client || !session) {
        return this.#respond(clientToken, client, 401);
      }
      for (const candidate of client.sessions) {
        if (candidate.userId === session.userId) {
          candidate.profileVersion += 1;
        }
      }
      return this.#respond(clientToken, client);
    });
  }
}
