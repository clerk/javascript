import { deepSnakeToCamel } from '@clerk/shared';
import type {
  ActJWTClaim,
  PublicUserData,
  SessionJSON,
  SessionResource,
  SessionStatus,
  TokenResource,
} from '@clerk/types';
import { GetToken, GetTokenOptions, UserResource } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { SessionTokenCache } from '../tokenCache';
import { BaseResource, Token, User } from './internal';

export class Session extends BaseResource implements SessionResource {
  pathRoot = '/client/sessions';

  id!: string;
  status!: SessionStatus;
  lastActiveAt!: Date;
  lastActiveToken!: TokenResource | null;
  lastActiveOrganizationId!: string | null;
  actor!: ActJWTClaim | null;
  user!: UserResource | null;
  publicUserData!: PublicUserData;
  expireAt!: Date;
  abandonAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  static isSessionResource(resource: unknown): resource is Session {
    return !!resource && resource instanceof Session;
  }

  constructor(data: SessionJSON) {
    super();

    this.fromJSON(data);
    this.#hydrateCache(this.lastActiveToken);
  }

  end = (): Promise<SessionResource> => {
    SessionTokenCache.clear();
    return this._basePost({
      action: 'end',
    });
  };

  remove = (): Promise<SessionResource> => {
    SessionTokenCache.clear();
    return this._basePost({
      action: 'remove',
    });
  };

  touch = (): Promise<SessionResource> => {
    return this._basePost({
      action: 'touch',
      body: { active_organization_id: this.lastActiveOrganizationId },
    });
  };

  getToken: GetToken = async (options?: GetTokenOptions): Promise<string | null> => {
    if (!this.user) {
      return null;
    }

    const { leewayInSeconds = 10, template, skipCache = false } = options || {};
    if (!template && leewayInSeconds >= 60) {
      throw new Error('Leeway can not exceed the token lifespan (60 seconds)');
    }

    if (!!template && this.#isLegacyIntegrationRequest(template)) {
      return this.#handleLegacyIntegrationToken({
        template,
        leewayInSeconds,
        skipCache,
      });
    }

    // If it's a session token, retrieve it with their session id, otherwise it's a jwt template token
    // and retrieve it using the session id concatenated with the jwt template name.
    // e.g. session id is 'sess_abc12345' and jwt template name is 'haris'
    // The session token ID will be 'sess_abc12345' and the jwt template token ID will be 'sess_abc12345-haris'
    const tokenId = template ? `${this.id}-${template}` : this.id;
    const cachedEntry = skipCache ? undefined : SessionTokenCache.get({ tokenId }, leewayInSeconds);

    if (cachedEntry) {
      return cachedEntry.tokenResolver.then(res => res.getRawString());
    }
    const path = template ? `${this.path()}/tokens/${template}` : `${this.path()}/tokens`;
    const tokenResolver = Token.create(path);
    SessionTokenCache.set({ tokenId, tokenResolver });
    return tokenResolver.then(res => res.getRawString());
  };

  #hydrateCache = (token: Token | null) => {
    if (token && SessionTokenCache.size() === 0) {
      SessionTokenCache.set({
        tokenId: this.id,
        tokenResolver: Promise.resolve(token),
      });
    }
  };

  #isLegacyIntegrationRequest = (template: string | undefined): boolean => {
    return (template || '').startsWith('integration_');
  };

  #removeLegacyIntegrationPrefix = (template: string | undefined): string => {
    return (template || '').replace('integration_', '');
  };

  // Can be removed once `integration_firebase` and `integration_hasura`
  // are no longer supported
  #handleLegacyIntegrationToken = async (options: GetTokenOptions): Promise<string> => {
    const { template, leewayInSeconds } = options;
    const cachedEntry = SessionTokenCache.get({ tokenId: this.user!.id, audience: template }, leewayInSeconds);
    if (cachedEntry) {
      return cachedEntry.tokenResolver.then(res => res.getRawString());
    }
    const resolver = Token.create(this.user!.pathRoot + '/tokens', {
      service: this.#removeLegacyIntegrationPrefix(template),
    });
    SessionTokenCache.set({
      tokenId: this.user!.id,
      audience: template,
      tokenResolver: resolver,
    });
    return resolver.then(res => res.getRawString());
  };

  protected fromJSON(data: SessionJSON): this {
    this.id = data.id;
    this.status = data.status;
    this.expireAt = unixEpochToDate(data.expire_at);
    this.abandonAt = unixEpochToDate(data.abandon_at);
    this.lastActiveAt = unixEpochToDate(data.last_active_at);
    this.lastActiveOrganizationId = data.last_active_organization_id;
    this.actor = data.actor;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.user = new User(data.user);
    this.publicUserData = deepSnakeToCamel(data.public_user_data) as PublicUserData;
    this.lastActiveToken = data.last_active_token ? new Token(data.last_active_token) : null;
    return this;
  }
}
