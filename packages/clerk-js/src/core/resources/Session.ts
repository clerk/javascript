import { runWithExponentialBackOff } from '@clerk/shared';
import { is4xxError } from '@clerk/shared/error';
import type {
  ActJWTClaim,
  CheckAuthorization,
  GetToken,
  GetTokenOptions,
  SessionJSON,
  SessionResource,
  SessionStatus,
  TokenResource,
  UserResource,
} from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { eventBus, events } from '../events';
import { SessionTokenCache } from '../tokenCache';
import { BaseResource, PublicUserData, Token, User } from './internal';

const stringsToNumbers: { [key in '1m' | '10m' | '1h' | '4h' | '1d' | '1w']: number } = {
  '1m': 1,
  '10m': 10,
  '1h': 60,
  '4h': 240, //4 * 60,
  '1d': 1440, //24 * 60,
  '1w': 10080, //7 * 24 * 60,
};

export class Session extends BaseResource implements SessionResource {
  pathRoot = '/client/sessions';
  factorVerificationAge: [number | null, number | null] = [null, null];
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

  clearCache = (): void => {
    return SessionTokenCache.clear();
  };

  getToken: GetToken = async (options?: GetTokenOptions): Promise<string | null> => {
    return runWithExponentialBackOff(() => this._getToken(options), {
      shouldRetry: (error: unknown, currentIteration: number) => !is4xxError(error) && currentIteration < 4,
    });
  };

  checkAuthorization: CheckAuthorization = params => {
    let orgAuthorization = null;
    let stepUpAuthorization = null;
    if (!this.user) {
      return false;
    }

    if (params.role || params.permission) {
      const orgMemberships = this.user.organizationMemberships || [];
      const activeMembership = orgMemberships.find(mem => mem.organization.id === this.lastActiveOrganizationId);

      const activeOrganizationPermissions = activeMembership?.permissions;
      const activeOrganizationRole = activeMembership?.role;

      const missingOrgs = activeMembership;

      if (params.permission && !missingOrgs) {
        orgAuthorization = activeOrganizationPermissions!.includes(params.permission);
      }

      if (params.role && !missingOrgs) {
        orgAuthorization = activeOrganizationRole === params.role;
      }
    }

    if (params.assurance && this.factorVerificationAge) {
      const hasValidFactorOne =
        this.factorVerificationAge[0] !== null
          ? stringsToNumbers[params.assurance.maxAge] > this.factorVerificationAge[0]
          : false;
      const hasValidFactorTwo =
        this.factorVerificationAge[1] !== null
          ? stringsToNumbers[params.assurance.maxAge] > this.factorVerificationAge[1]
          : false;

      if (params.assurance.level === 'firstFactor') {
        stepUpAuthorization = hasValidFactorOne;
      } else if (params.assurance.level === 'secondFactor') {
        stepUpAuthorization = hasValidFactorTwo;
      } else {
        stepUpAuthorization = hasValidFactorOne && hasValidFactorTwo;
      }
    }

    return [orgAuthorization, stepUpAuthorization].filter(Boolean).some(a => a === true);
  };

  #hydrateCache = (token: TokenResource | null) => {
    if (token) {
      SessionTokenCache.set({
        tokenId: this.#getCacheId(),
        tokenResolver: Promise.resolve(token),
      });
      eventBus.dispatch(events.TokenUpdate, { token });
    }
  };

  // If it's a session token, retrieve it with their session id, otherwise it's a jwt template token
  // and retrieve it using the session id concatenated with the jwt template name.
  // e.g. session id is 'sess_abc12345' and jwt template name is 'haris'
  // The session token ID will be 'sess_abc12345' and the jwt template token ID will be 'sess_abc12345-haris'
  #getCacheId(template?: string, organizationId?: string) {
    return [this.id, template, organizationId, this.updatedAt.getTime()].filter(Boolean).join('-');
  }

  protected fromJSON(data: SessionJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.status = data.status;
    this.expireAt = unixEpochToDate(data.expire_at);
    this.abandonAt = unixEpochToDate(data.abandon_at);
    this.factorVerificationAge = data.factor_verification_age;
    this.lastActiveAt = unixEpochToDate(data.last_active_at);
    this.lastActiveOrganizationId = data.last_active_organization_id;
    this.actor = data.actor;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.user = new User(data.user);

    if (data.public_user_data) {
      this.publicUserData = new PublicUserData(data.public_user_data);
    }

    this.lastActiveToken = data.last_active_token ? new Token(data.last_active_token) : null;

    return this;
  }

  private async _getToken(options?: GetTokenOptions): Promise<string | null> {
    if (!this.user) {
      return null;
    }

    const {
      leewayInSeconds,
      template,
      skipCache = false,
      organizationId = Session.clerk.organization?.id,
    } = options || {};

    if (!template && Number(leewayInSeconds) >= 60) {
      throw new Error('Leeway can not exceed the token lifespan (60 seconds)');
    }

    const tokenId = this.#getCacheId(template, organizationId);
    const cachedEntry = skipCache ? undefined : SessionTokenCache.get({ tokenId }, leewayInSeconds);

    // Dispatch tokenUpdate only for __session tokens with the session's active organization ID, and not JWT templates
    const shouldDispatchTokenUpdate = !template && options?.organizationId === Session.clerk.organization?.id;

    if (cachedEntry) {
      const cachedToken = await cachedEntry.tokenResolver;
      if (shouldDispatchTokenUpdate) {
        eventBus.dispatch(events.TokenUpdate, { token: cachedToken });
      }
      // Return null when raw string is empty to indicate that there it's signed-out
      return cachedToken.getRawString() || null;
    }
    const path = template ? `${this.path()}/tokens/${template}` : `${this.path()}/tokens`;
    // TODO: update template endpoint to accept organizationId
    const params = template ? {} : { ...(organizationId && { organizationId }) };
    const tokenResolver = Token.create(path, params);
    SessionTokenCache.set({ tokenId, tokenResolver });
    return tokenResolver.then(token => {
      if (shouldDispatchTokenUpdate) {
        eventBus.dispatch(events.TokenUpdate, { token });
      }
      // Return null when raw string is empty to indicate that there it's signed-out
      return token.getRawString() || null;
    });
  }
}
