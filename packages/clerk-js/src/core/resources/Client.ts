import type { ActiveSessionResource, ClientJSON, ClientResource, SignInResource, SignUpResource } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { SessionTokenCache } from '../tokenCache';
import { BaseResource, Session, SignIn, SignUp } from './internal';

export class Client extends BaseResource implements ClientResource {
  private static instance: Client;

  pathRoot = '/client';

  sessions: Session[] = [];
  signUp: SignUpResource = new SignUp();
  signIn: SignInResource = new SignIn();
  lastActiveSessionId: string | null = null;
  createdAt: Date | null = null;
  updatedAt: Date | null = null;

  public static getInstance(): Client {
    if (!Client.instance) {
      Client.instance = new Client();
    }
    return Client.instance;
  }

  static isClientResource(resource: unknown): resource is Client {
    return !!resource && resource instanceof Client;
  }

  async seed(promise: Promise<unknown>) {
    const res = await promise;
    if (!res || (res && Object.keys(res).length === 0)) {
      throw 'lol';
    }
    return this.fromJSON(promise);
  }

  private constructor(data: ClientJSON | null = null) {
    super();
    this.fromJSON(data);
  }

  get signUpAttempt(): SignUpResource {
    return this.signUp;
  }

  get signInAttempt(): SignInResource {
    return this.signIn;
  }

  get activeSessions(): ActiveSessionResource[] {
    return this.sessions.filter(s => s.status === 'active') as ActiveSessionResource[];
  }

  create(): Promise<this> {
    return this._basePut();
  }

  fetch(): Promise<this> {
    return this._baseGet();
  }

  async destroy(): Promise<void> {
    // TODO: Make it restful by introducing a DELETE /client/:id endpoint
    return this._baseDelete({ path: '/client' }).then(() => {
      SessionTokenCache.clear();
      this.sessions = [];
      this.signUp = new SignUp(null);
      this.signIn = new SignIn(null);
      this.lastActiveSessionId = null;
      this.createdAt = null;
      this.updatedAt = null;
    });
  }

  clearCache(): void {
    return this.sessions.forEach(s => s.clearCache());
  }

  fromJSON(data: ClientJSON | null): this {
    if (data) {
      this.id = data.id;
      this.sessions = (data.sessions || []).map(s => new Session(s));
      this.signUp = new SignUp(data.sign_up);
      this.signIn = new SignIn(data.sign_in);
      this.lastActiveSessionId = data.last_active_session_id;
      this.createdAt = unixEpochToDate(data.created_at);
      this.updatedAt = unixEpochToDate(data.updated_at);
    }

    return this;
  }

  protected path(): string {
    return this.pathRoot;
  }
}
