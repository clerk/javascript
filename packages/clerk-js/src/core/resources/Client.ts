import type {
  ActiveSessionResource,
  ClientJSON,
  ClientJSONSnapshot,
  ClientResource,
  LastAuthenticationStrategy,
  SignedInSessionResource,
  SignInResource,
  SignUpResource,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { SessionTokenCache } from '../tokenCache';
import { BaseResource, Session, SignIn, SignUp } from './internal';

export class Client extends BaseResource implements ClientResource {
  private static instance: Client | null | undefined;

  pathRoot = '/client';

  sessions: Session[] = [];
  signUp: SignUpResource = new SignUp();
  signIn: SignInResource = new SignIn();
  lastActiveSessionId: string | null = null;
  captchaBypass = false;
  cookieExpiresAt: Date | null = null;
  /** Last authentication strategy used by this client; `null` when unknown/disabled. */
  lastAuthenticationStrategy: LastAuthenticationStrategy | null = null;
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
      this.lastAuthenticationStrategy = null;
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
    if (data) {
      this.id = data.id;
      this.sessions = (data.sessions || []).map(s => new Session(s));
      this.signUp = new SignUp(data.sign_up);
      this.signIn = new SignIn(data.sign_in);
      this.lastActiveSessionId = data.last_active_session_id;
      this.captchaBypass = data.captcha_bypass || false;
      this.cookieExpiresAt = data.cookie_expires_at ? unixEpochToDate(data.cookie_expires_at) : null;
      this.lastAuthenticationStrategy = data.last_authentication_strategy || null;
      this.createdAt = unixEpochToDate(data.created_at || undefined);
      this.updatedAt = unixEpochToDate(data.updated_at || undefined);
    }

    return this;
  }

  public __internal_toSnapshot(): ClientJSONSnapshot {
    return {
      object: 'client',
      id: this.id || '',
      sessions: this.sessions.map(s => s.__internal_toSnapshot()),
      sign_up: this.signUp.__internal_toSnapshot(),
      sign_in: this.signIn.__internal_toSnapshot(),
      last_active_session_id: this.lastActiveSessionId,
      captcha_bypass: this.captchaBypass,
      cookie_expires_at: this.cookieExpiresAt ? this.cookieExpiresAt.getTime() : null,
      last_authentication_strategy: this.lastAuthenticationStrategy ?? null,
      created_at: this.createdAt?.getTime() ?? null,
      updated_at: this.updatedAt?.getTime() ?? null,
    };
  }

  protected path(): string {
    return this.pathRoot;
  }
}
