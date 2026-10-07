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

function networkRoundTrip(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
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
 * both SDKs only ever see server state through these requests.
 */
export class FakeClerkServer {
  readonly requests: FapiRequestLogEntry[] = [];
  #clients = new Map<string, FakeServerClientJSON>();
  #clientIdByToken = new Map<string, string>();
  #pendingRotations = new Map<string, number>();
  #sequence = 0;

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

  #createClient(): { client: FakeServerClientJSON; token: string } {
    const client: FakeServerClientJSON = { id: this.#nextId('client'), sessions: [], lastActiveSessionId: null };
    const token = this.#nextId(`device_token_${client.id}`);
    this.#clients.set(client.id, client);
    this.#clientIdByToken.set(token, client.id);
    return { client, token };
  }

  #respond(token: string | null, client: FakeServerClientJSON | null, status: 200 | 401 = 200): FapiResponse {
    let responseToken = client ? token : null;
    const pendingRotations = client ? (this.#pendingRotations.get(client.id) ?? 0) : 0;
    if (client && pendingRotations > 0) {
      this.#pendingRotations.set(client.id, pendingRotations - 1);
      responseToken = this.#nextId(`device_token_${client.id}`);
      this.#clientIdByToken.set(responseToken, client.id);
    }
    return { status, client: client ? cloneClient(client) : null, token: responseToken };
  }

  async #request(caller: FapiCaller, operation: string, token: string | null): Promise<void> {
    this.requests.push({ caller, operation, token });
    await networkRoundTrip();
  }

  // Seeding helpers (no request is logged).

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

  // Frontend API

  async getClient(caller: FapiCaller, token: string | null): Promise<FapiResponse> {
    await this.#request(caller, 'GET /client', token);
    return this.#respond(token, this.#clientFor(token));
  }

  async createSessionlessClient(caller: FapiCaller): Promise<FapiResponse> {
    await this.#request(caller, 'POST /client', null);
    const { client, token } = this.#createClient();
    return this.#respond(token, client);
  }

  async signIn(
    caller: FapiCaller,
    token: string | null,
    userId: string,
  ): Promise<FapiResponse & { sessionId: string }> {
    await this.#request(caller, 'POST /client/sign_ins', token);
    let client = this.#clientFor(token);
    let responseToken = token;
    if (!client) {
      const created = this.#createClient();
      client = created.client;
      responseToken = created.token;
    }
    const session = { id: this.#nextId('sess'), userId, profileVersion: 0, activityVersion: 0 };
    client.sessions.push(session);
    client.lastActiveSessionId = session.id;
    return { ...this.#respond(responseToken, client), sessionId: session.id };
  }

  async touchSession(caller: FapiCaller, token: string | null, sessionId: string): Promise<FapiResponse> {
    await this.#request(caller, 'POST /client/sessions/:id/touch', token);
    const client = this.#clientFor(token);
    if (!client?.sessions.some(session => session.id === sessionId)) {
      return this.#respond(token, client, 401);
    }
    client.lastActiveSessionId = sessionId;
    return this.#respond(token, client);
  }

  async removeSession(caller: FapiCaller, token: string | null, sessionId: string): Promise<FapiResponse> {
    await this.#request(caller, 'POST /client/sessions/:id/remove', token);
    const client = this.#clientFor(token);
    if (!client) {
      return this.#respond(token, null, 401);
    }
    client.sessions = client.sessions.filter(session => session.id !== sessionId);
    if (client.lastActiveSessionId === sessionId) {
      client.lastActiveSessionId = client.sessions[0]?.id ?? null;
    }
    return this.#respond(token, client);
  }

  async removeAllSessions(caller: FapiCaller, token: string | null): Promise<FapiResponse> {
    await this.#request(caller, 'DELETE /client/sessions', token);
    const client = this.#clientFor(token);
    if (client) {
      client.sessions = [];
      client.lastActiveSessionId = null;
    }
    return this.#respond(token, client);
  }

  async createSessionToken(caller: FapiCaller, token: string | null, sessionId: string): Promise<FapiResponse> {
    await this.#request(caller, 'POST /client/sessions/:id/tokens', token);
    const client = this.#clientFor(token);
    const session = client?.sessions.find(candidate => candidate.id === sessionId);
    if (session) {
      session.activityVersion += 1;
    }
    return this.#respond(token, client, session ? 200 : 401);
  }

  async updateUser(caller: FapiCaller, token: string | null, sessionId: string): Promise<FapiResponse> {
    await this.#request(caller, 'PATCH /me', token);
    const client = this.#clientFor(token);
    const session = client?.sessions.find(candidate => candidate.id === sessionId);
    if (!client || !session) {
      return this.#respond(token, client, 401);
    }
    for (const candidate of client.sessions) {
      if (candidate.userId === session.userId) {
        candidate.profileVersion += 1;
      }
    }
    return this.#respond(token, client);
  }
}
