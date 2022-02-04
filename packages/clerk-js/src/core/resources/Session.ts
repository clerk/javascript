import type {
  GetSessionTokenOptions,
  PublicUserData,
  SessionJSON,
  SessionResource,
  SessionStatus,
} from '@clerk/types';
import { unixEpochToDate } from 'utils/date';

import { SessionTokenCache } from '../tokenCache';
import { BaseResource } from './Base';
import { Token } from './Token';
import { User } from './User';

export class Session extends BaseResource implements SessionResource {
  pathRoot = '/client/sessions';

  id!: string;
  status!: SessionStatus;
  lastActiveAt!: Date;
  lastActiveToken!: Token | null;
  user!: any;
  publicUserData!: PublicUserData;
  expireAt!: Date;
  abandonAt!: Date;
  updatedAt!: Date;

  static isSessionResource(resource: unknown): resource is Session {
    return !!resource && resource instanceof Session;
  }

  constructor(data: SessionJSON) {
    super();

    this.fromJSON(data);
    this.hydrateCache(this.lastActiveToken);
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

  revoke = (): Promise<SessionResource> => {
    SessionTokenCache.clear();
    return this._basePost({
      action: 'revoke',
    });
  };

  touch = (): Promise<SessionResource> => {
    return this._basePost({
      action: 'touch',
    });
  };

  getToken = async (options?: GetSessionTokenOptions): Promise<string> => {
    const { leewayInSeconds = 10, throwOnError = true, template } =
      options || {};

    if (!template && leewayInSeconds >= 60) {
      throw 'Leeway can not exceed the token lifespan (60 seconds)';
    }

    // If it's a session token, retrieve it with their session id, otherwise it's a jwt template token
    // and retrieve it using the session id concatenated with the jwt template name.
    // e.g. session id is 'sess_abc12345' and jwt template name is 'haris'
    // The session token ID will be 'sess_abc12345' and the jwt template token ID will be 'sess_abc12345-haris'
    const tokenId = template ? `${this.id}-${template}` : this.id;

    const cachedEntry = SessionTokenCache.get({ tokenId }, leewayInSeconds);

    let tokenResolver;

    if (cachedEntry) {
      tokenResolver = cachedEntry.tokenResolver;
    } else {
      const path = template
        ? `${this.path()}/tokens/${template}`
        : `${this.path()}/tokens`;

      tokenResolver = Token.create(path);
      SessionTokenCache.set({ tokenId, tokenResolver });
    }

    return tokenResolver
      .then(res => res.getRawString())
      .catch(err => {
        if (throwOnError) {
          throw err;
        }
        return '';
      });
  };

  private hydrateCache = (token: Token | null) => {
    if (token && SessionTokenCache.size() === 0) {
      SessionTokenCache.set({
        tokenId: this.id,
        tokenResolver: Promise.resolve(token),
      });
    }
  };

  protected fromJSON(data: SessionJSON): this {
    this.id = data.id;
    this.status = data.status;
    this.expireAt = unixEpochToDate(data.expire_at);
    this.abandonAt = unixEpochToDate(data.abandon_at);
    this.lastActiveAt = unixEpochToDate(data.last_active_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.user = new User(data.user);
    this.publicUserData = {
      firstName: data.public_user_data.first_name,
      lastName: data.public_user_data.last_name,
      profileImageUrl: data.public_user_data.profile_image_url,
      identifier: data.public_user_data.identifier,
    };
    this.lastActiveToken = data.last_active_token
      ? new Token(data.last_active_token)
      : null;
    return this;
  }
}
