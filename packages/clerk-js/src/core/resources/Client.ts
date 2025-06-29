import type {
  ActiveSessionResource,
  ClientJSON,
  ClientJSONSnapshot,
  ClientResource,
  SessionJSON,
  SignedInSessionResource,
  SignInResource,
  SignUpResource,
} from '@clerk/types';

import { SessionTokenCache } from '../tokenCache';
import { BaseResource, Session, SignIn, SignUp } from './internal';
import { parseJSON, serializeToJSON } from './parser';

export class Client extends BaseResource implements ClientResource {
  private static instance: Client | null | undefined;

  pathRoot = '/client';

  sessions: Session[] = [];
  signUp: SignUpResource = new SignUp();
  signIn: SignInResource = new SignIn();
  lastActiveSessionId: string | null = null;
  captchaBypass = false;
  cookieExpiresAt: Date | null = null;
  createdAt: Date | null = null;
  updatedAt: Date | null = null;

  public static getOrCreateInstance(data: ClientJSON | ClientJSONSnapshot | null = null): Client {
    if (!Client.instance) {
      Client.instance = new Client(data);
    }
    return Client.instance;
  }

  static clearInstance() {
    Client.instance = null;
  }

  static isClientResource(resource: unknown): resource is Client {
    return !!resource && resource instanceof Client;
  }

  private constructor(data: ClientJSON | ClientJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  get signUpAttempt(): SignUpResource {
    return this.signUp;
  }

  get signInAttempt(): SignInResource {
    return this.signIn;
  }

  /**
   * @deprecated Use `signedInSessions()` instead.
   */
  get activeSessions(): ActiveSessionResource[] {
    return this.sessions.filter(s => s.status === 'active') as ActiveSessionResource[];
  }

  get signedInSessions(): SignedInSessionResource[] {
    return this.sessions.filter(s => s.status === 'active' || s.status === 'pending') as SignedInSessionResource[];
  }

  create(): Promise<this> {
    return this._basePut();
  }

  fetch({ fetchMaxTries }: { fetchMaxTries?: number } = {}): Promise<this> {
    return this._baseGet({ fetchMaxTries });
  }

  async destroy(): Promise<void> {
    // TODO: Make it restful by introducing a DELETE /client/:id endpoint
    return this._baseDelete({ path: '/client' }).then(() => {
      SessionTokenCache.clear();
      this.id = '';
      this.sessions = [];
      this.signUp = new SignUp(null);
      this.signIn = new SignIn(null);
      this.lastActiveSessionId = null;
      this.cookieExpiresAt = null;
      this.createdAt = null;
      this.updatedAt = null;
    });
  }

  removeSessions(): Promise<ClientResource> {
    return this._baseDelete({
      path: this.path() + '/sessions',
    }).then(e => {
      SessionTokenCache.clear();
      return e as unknown as ClientResource;
    });
  }

  clearCache(): void {
    return this.sessions.forEach(s => s.clearCache());
  }

  // isEligibleForTouch returns true if the client cookie is due to expire in 8 days or less
  isEligibleForTouch(): boolean {
    return !!this.cookieExpiresAt && this.cookieExpiresAt.getTime() - Date.now() <= 8 * 24 * 60 * 60 * 1000; // 8 days
  }

  buildTouchUrl({ redirectUrl }: { redirectUrl: URL }) {
    return BaseResource.fapiClient
      .buildUrl({
        method: 'GET',
        path: '/client/touch',
        pathPrefix: 'v1',
        search: { redirect_url: redirectUrl.toString() },
      })
      .toString();
  }

  public __internal_sendCaptchaToken(params: unknown): Promise<ClientResource> {
    return this._basePostBypass({ body: params, path: this.path() + '/verify' });
  }

  fromJSON(data: ClientJSON | ClientJSONSnapshot | null): this {
    Object.assign(
      this,
      parseJSON<Client>(data, {
        dateFields: ['cookieExpiresAt', 'createdAt', 'updatedAt'],
        customTransforms: {
          sessions: (value: SessionJSON[] | null | undefined) => (value || []).map(s => new Session(s)),
          signUp: value => new SignUp(value),
          signIn: value => new SignIn(value),
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): ClientJSONSnapshot {
    return {
      object: 'client',
      ...serializeToJSON(this, {
        nestedFields: ['signUp', 'signIn'],
        arrayFields: ['sessions'],
      }),
    } as ClientJSONSnapshot;
  }

  protected path(): string {
    return this.pathRoot;
  }
}
