import { createCheckAuthorization } from '@clerk/shared/authorization';
import { ClerkWebAuthnError, is4xxError } from '@clerk/shared/error';
import { retry } from '@clerk/shared/retry';
import type {
  ActClaim,
  CheckAuthorization,
  EmailCodeConfig,
  EnterpriseSSOConfig,
  GetToken,
  GetTokenOptions,
  PhoneCodeConfig,
  SessionJSON,
  SessionJSONSnapshot,
  SessionResource,
  SessionStatus,
  SessionTask,
  SessionVerificationJSON,
  SessionVerificationResource,
  SessionVerifyAttemptFirstFactorParams,
  SessionVerifyAttemptSecondFactorParams,
  SessionVerifyCreateParams,
  SessionVerifyPrepareFirstFactorParams,
  SessionVerifyPrepareSecondFactorParams,
  TokenResource,
  UserResource,
} from '@clerk/shared/types';
import { isWebAuthnSupported as isWebAuthnSupportedOnWindow } from '@clerk/shared/webauthn';

import { unixEpochToDate } from '@/utils/date';
import { debugLogger } from '@/utils/debug';
import {
  convertJSONToPublicKeyRequestOptions,
  serializePublicKeyCredentialAssertion,
  webAuthnGetCredential as webAuthnGetCredentialOnWindow,
} from '@/utils/passkeys';
import { TokenId } from '@/utils/tokenId';

import { clerkInvalidStrategy, clerkMissingWebAuthnPublicKeyOptions } from '../errors';
import { eventBus, events } from '../events';
import { SessionTokenCache } from '../tokenCache';
import { BaseResource, PublicUserData, Token, User } from './internal';
import { SessionVerification } from './SessionVerification';

export class Session extends BaseResource implements SessionResource {
  pathRoot = '/client/sessions';

  id!: string;
  status!: SessionStatus;
  lastActiveAt!: Date;
  lastActiveToken!: TokenResource | null;
  lastActiveOrganizationId!: string | null;
  actor!: ActClaim | null;
  user!: UserResource | null;
  publicUserData!: PublicUserData;
  factorVerificationAge: [number, number] | null = null;
  tasks: Array<SessionTask> | null = null;
  expireAt!: Date;
  abandonAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  static isSessionResource(resource: unknown): resource is Session {
    return !!resource && resource instanceof Session;
  }

  constructor(data: SessionJSON | SessionJSONSnapshot) {
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
    }).then(res => {
      // touch() will potentially change the session state, and so we need to ensure we emit the updated token that comes back in the response. This avoids potential issues where the session cookie is out of sync with the current session state.
      if (res.lastActiveToken) {
        eventBus.emit(events.TokenUpdate, { token: res.lastActiveToken });
      }
      return res;
    });
  };

  clearCache = (): void => {
    return SessionTokenCache.clear();
  };

  getToken: GetToken = async (options?: GetTokenOptions): Promise<string | null> => {
    // This will retry the getToken call if it fails with a non-4xx error
    // We're going to trigger 8 retries in the span of ~3 minutes,
    // Example delays: 3s, 5s, 13s, 19s, 26s, 34s, 43s, 50s, total: ~193s
    return retry(() => this._getToken(options), {
      factor: 1.55,
      initialDelay: 3 * 1000,
      maxDelayBetweenRetries: 50 * 1_000,
      jitter: false,
      shouldRetry: (error, iterationsCount) => {
        return !is4xxError(error) && iterationsCount <= 8;
      },
    });
  };

  checkAuthorization: CheckAuthorization = params => {
    const orgMemberships = this.user?.organizationMemberships || [];
    const activeMembership = orgMemberships.find(mem => mem.organization.id === this.lastActiveOrganizationId);
    return createCheckAuthorization({
      userId: this.user?.id,
      factorVerificationAge: this.factorVerificationAge,
      orgId: activeMembership?.id,
      orgRole: activeMembership?.role,
      orgPermissions: activeMembership?.permissions,
      features: (this.lastActiveToken?.jwt?.claims.fea as string) || '',
      plans: (this.lastActiveToken?.jwt?.claims.pla as string) || '',
    })(params);
  };

  #hydrateCache = (token: TokenResource | null) => {
    if (!token) {
      return;
    }

    const tokenId = this.#getCacheId();
    const existing = SessionTokenCache.get({ tokenId });
    if (!existing) {
      SessionTokenCache.set({
        tokenId,
        tokenResolver: Promise.resolve(token),
      });
    }
  };

  // If it's a session token, retrieve it with their session id, otherwise it's a jwt template token
  // and retrieve it using the session id concatenated with the jwt template name.
  // e.g. session id is 'sess_abc12345' and jwt template name is 'haris'
  // The session token ID will be 'sess_abc12345' and the jwt template token ID will be 'sess_abc12345-haris'
  #getCacheId(template?: string, organizationId?: string | null) {
    const resolvedOrganizationId =
      typeof organizationId === 'undefined' ? this.lastActiveOrganizationId : organizationId;
    return TokenId.build(this.id, template, resolvedOrganizationId);
  }

  startVerification = async ({ level }: SessionVerifyCreateParams): Promise<SessionVerificationResource> => {
    const json = (
      await BaseResource._fetch({
        method: 'POST',
        path: `/client/sessions/${this.id}/verify`,
        body: {
          level,
        } as any,
      })
    )?.response as unknown as SessionVerificationJSON;

    return new SessionVerification(json);
  };

  prepareFirstFactorVerification = async (
    factor: SessionVerifyPrepareFirstFactorParams,
  ): Promise<SessionVerificationResource> => {
    let config;
    switch (factor.strategy) {
      case 'email_code':
        config = { emailAddressId: factor.emailAddressId } as EmailCodeConfig;
        break;
      case 'phone_code':
        config = {
          phoneNumberId: factor.phoneNumberId,
          default: factor.default,
        } as PhoneCodeConfig;
        break;
      case 'passkey':
        config = {};
        break;
      case 'enterprise_sso':
        config = {
          emailAddressId: factor.emailAddressId,
          enterpriseConnectionId: factor.enterpriseConnectionId,
          redirectUrl: factor.redirectUrl,
        } as EnterpriseSSOConfig;
        break;
      default:
        clerkInvalidStrategy('Session.prepareFirstFactorVerification', (factor as any).strategy);
    }

    const json = (
      await BaseResource._fetch({
        method: 'POST',
        path: `/client/sessions/${this.id}/verify/prepare_first_factor`,
        body: {
          ...config,
          strategy: factor.strategy,
        } as any,
      })
    )?.response as unknown as SessionVerificationJSON;

    return new SessionVerification(json);
  };

  attemptFirstFactorVerification = async (
    attemptFactor: SessionVerifyAttemptFirstFactorParams,
  ): Promise<SessionVerificationResource> => {
    let config;
    switch (attemptFactor.strategy) {
      case 'passkey': {
        config = {
          publicKeyCredential: JSON.stringify(serializePublicKeyCredentialAssertion(attemptFactor.publicKeyCredential)),
        };
        break;
      }
      default:
        config = { ...attemptFactor };
    }

    const json = (
      await BaseResource._fetch({
        method: 'POST',
        path: `/client/sessions/${this.id}/verify/attempt_first_factor`,
        body: { ...config, strategy: attemptFactor.strategy } as any,
      })
    )?.response as unknown as SessionVerificationJSON;

    return new SessionVerification(json);
  };

  verifyWithPasskey = async (): Promise<SessionVerificationResource> => {
    const prepareResponse = await this.prepareFirstFactorVerification({ strategy: 'passkey' });

    const { nonce = null } = prepareResponse.firstFactorVerification;

    /**
     * The UI should always prevent from this method being called if WebAuthn is not supported.
     * As a precaution we need to check if WebAuthn is supported.
     */
    const isWebAuthnSupported = Session.clerk.__internal_isWebAuthnSupported || isWebAuthnSupportedOnWindow;
    const webAuthnGetCredential = Session.clerk.__internal_getPublicCredentials || webAuthnGetCredentialOnWindow;

    if (!isWebAuthnSupported()) {
      throw new ClerkWebAuthnError('Passkeys are not supported', {
        code: 'passkey_not_supported',
      });
    }

    const publicKeyOptions = nonce ? convertJSONToPublicKeyRequestOptions(JSON.parse(nonce)) : null;

    if (!publicKeyOptions) {
      clerkMissingWebAuthnPublicKeyOptions('get');
    }

    const { publicKeyCredential, error } = await webAuthnGetCredential({
      publicKeyOptions,
      conditionalUI: false,
    });

    if (!publicKeyCredential) {
      throw error;
    }

    return this.attemptFirstFactorVerification({
      strategy: 'passkey',
      publicKeyCredential,
    });
  };

  prepareSecondFactorVerification = async (
    params: SessionVerifyPrepareSecondFactorParams,
  ): Promise<SessionVerificationResource> => {
    const json = (
      await BaseResource._fetch({
        method: 'POST',
        path: `/client/sessions/${this.id}/verify/prepare_second_factor`,
        body: params as any,
      })
    )?.response as unknown as SessionVerificationJSON;

    return new SessionVerification(json);
  };

  attemptSecondFactorVerification = async (
    attemptFactor: SessionVerifyAttemptSecondFactorParams,
  ): Promise<SessionVerificationResource> => {
    const json = (
      await BaseResource._fetch({
        method: 'POST',
        path: `/client/sessions/${this.id}/verify/attempt_second_factor`,
        body: attemptFactor as any,
      })
    )?.response as unknown as SessionVerificationJSON;

    return new SessionVerification(json);
  };

  protected fromJSON(data: SessionJSON | SessionJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.status = data.status;
    this.expireAt = unixEpochToDate(data.expire_at);
    this.abandonAt = unixEpochToDate(data.abandon_at);
    this.factorVerificationAge = data.factor_verification_age;
    this.lastActiveAt = unixEpochToDate(data.last_active_at || undefined);
    this.lastActiveOrganizationId = data.last_active_organization_id;
    this.actor = data.actor || null;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.user = new User(data.user);
    this.tasks = data.tasks || null;

    if (data.public_user_data) {
      this.publicUserData = new PublicUserData(data.public_user_data);
    }

    this.lastActiveToken = data.last_active_token ? new Token(data.last_active_token) : null;

    return this;
  }

  public __internal_toSnapshot(): SessionJSONSnapshot {
    return {
      object: 'session',
      id: this.id,
      status: this.status,
      expire_at: this.expireAt.getTime(),
      abandon_at: this.abandonAt.getTime(),
      factor_verification_age: this.factorVerificationAge,
      last_active_at: this.lastActiveAt.getTime(),
      last_active_organization_id: this.lastActiveOrganizationId,
      actor: this.actor,
      tasks: this.tasks,
      user: this.user?.__internal_toSnapshot() || null,
      public_user_data: this.publicUserData.__internal_toSnapshot(),
      last_active_token: this.lastActiveToken?.__internal_toSnapshot() || null,
      created_at: this.createdAt.getTime(),
      updated_at: this.updatedAt.getTime(),
    };
  }

  private async _getToken(options?: GetTokenOptions): Promise<string | null> {
    if (!this.user) {
      return null;
    }

    const { leewayInSeconds, template, skipCache = false } = options || {};

    // If no organization ID is provided, default to the selected organization in memory
    // Note: this explicitly allows passing `null` or `""`, which should select the personal workspace.
    const organizationId =
      typeof options?.organizationId === 'undefined' ? this.lastActiveOrganizationId : options?.organizationId;

    if (!template && Number(leewayInSeconds) >= 60) {
      throw new Error('Leeway can not exceed the token lifespan (60 seconds)');
    }

    const tokenId = this.#getCacheId(template, organizationId);

    const cachedEntry = skipCache ? undefined : SessionTokenCache.get({ tokenId }, leewayInSeconds);

    // Dispatch tokenUpdate only for __session tokens with the session's active organization ID, and not JWT templates
    const shouldDispatchTokenUpdate = !template && organizationId === this.lastActiveOrganizationId;

    if (cachedEntry) {
      debugLogger.debug(
        'Using cached token (no fetch needed)',
        {
          tokenId,
        },
        'session',
      );
      const cachedToken = await cachedEntry.tokenResolver;
      if (shouldDispatchTokenUpdate) {
        eventBus.emit(events.TokenUpdate, { token: cachedToken });
      }
      // Return null when raw string is empty to indicate that there it's signed-out
      return cachedToken.getRawString() || null;
    }

    debugLogger.info(
      'Fetching new token from API',
      {
        organizationId,
        template,
        tokenId,
      },
      'session',
    );

    const path = template ? `${this.path()}/tokens/${template}` : `${this.path()}/tokens`;

    // TODO: update template endpoint to accept organizationId
    const params: Record<string, string | null> = template ? {} : { organizationId };

    const tokenResolver = Token.create(path, params, skipCache);

    // Cache the promise immediately to prevent concurrent calls from triggering duplicate requests
    SessionTokenCache.set({ tokenId, tokenResolver });

    return tokenResolver.then(token => {
      if (shouldDispatchTokenUpdate) {
        eventBus.emit(events.TokenUpdate, { token });

        if (token.jwt) {
          this.lastActiveToken = token;
          // Emits the updated session with the new token to the state listeners
          eventBus.emit(events.SessionTokenResolved, null);
        }
      }

      // Return null when raw string is empty to indicate that there it's signed-out
      return token.getRawString() || null;
    });
  }

  get currentTask() {
    const [task] = this.tasks ?? [];
    return task;
  }
}
