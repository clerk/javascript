import type {
  ClientJSON,
  OrganizationResource,
  SessionJSON,
  SessionResource,
  TokenJSON,
  UserResource,
} from '@clerk/shared/types';

import { UserService } from './UserService';

export type ClerkAPIResponse<T> = {
  response: T;
};

export type ClientResponse = {
  client: ClientJSON;
  response: SessionJSON;
};

// Keys to exclude from serialization (functions and internal methods)
const EXCLUDED_KEYS = new Set([
  'checkAuthorization',
  'clearCache',
  'attemptFirstFactorVerification',
  'attemptSecondFactorVerification',
  'end',
  'getToken',
  'prepareFirstFactorVerification',
  'prepareSecondFactorVerification',
  'remove',
  'resolve',
  'startVerification',
  'touch',
  'verifyWithPasskey',
  '__internal_toSnapshot',
  'create',
  'destroy',
  'update',
  'addMember',
  'createDomain',
  'getDomains',
  'getInvitations',
  'getMembershipRequests',
  'getMemberships',
  'getRoles',
  'inviteMember',
  'inviteMembers',
  'removeMember',
  'setLogo',
]);

function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj === 'function') return undefined;
  if (typeof obj !== 'object') return obj;

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Skip functions and excluded keys
      if (typeof obj[key] === 'function' || EXCLUDED_KEYS.has(key)) {
        continue;
      }
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
    }
  }
  return result;
}

export class SessionService {
  static createSession(options: { user: UserResource; sessionId?: string }): SessionResource {
    return this.create(options.user, options.sessionId);
  }

  static create(user: UserResource, sessionId = 'sess_basic'): SessionResource {
    const session = {
      abandonAt: new Date(Date.now() + 86400000 * 30),
      actor: null,
      checkAuthorization: () => true,
      clearCache: () => {},
      createdAt: new Date(),
      currentTask: undefined,
      expireAt: new Date(Date.now() + 86400000 * 7),
      factorVerificationAge: [0, 600000],
      id: sessionId,
      lastActiveAt: new Date(),
      lastActiveOrganizationId: null,
      lastActiveToken: null,
      object: 'session',
      publicUserData: {
        firstName: user.firstName,
        hasImage: user.hasImage,
        identifier: user.primaryEmailAddress?.emailAddress || user.primaryPhoneNumber?.phoneNumber || '',
        imageUrl: user.imageUrl,
        lastName: user.lastName,
        userId: user.id,
      },
      status: 'active',
      tasks: null,
      updatedAt: new Date(),
      user,
      attemptFirstFactorVerification: async () => ({}) as any,
      attemptSecondFactorVerification: async () => ({}) as any,
      end: async () => session,
      getToken: async () => 'mock-token',
      prepareFirstFactorVerification: async () => ({}) as any,
      prepareSecondFactorVerification: async () => ({}) as any,
      remove: async () => session,
      startVerification: async () => ({}) as any,
      touch: async () => session,
      verifyWithPasskey: async () => ({}) as any,
      __internal_toSnapshot: () => ({}) as any,
    } as unknown as SessionResource;

    return session;
  }

  static setOrganization(session: SessionResource, organization: OrganizationResource): void {
    (session as any).lastActiveOrganizationId = organization.id;
  }

  static async generateToken(
    user: UserResource,
    session: SessionResource,
    organizationId?: string | null,
  ): Promise<{ jwt: string; object: string }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      jwt: UserService.generateJWT(user.id, session.id, organizationId),
      object: 'token',
    };
  }

  static serialize(data: any): any {
    return toSnakeCase(data);
  }

  static getClientState(session: SessionResource | null): ClerkAPIResponse<ClientJSON> {
    if (!session) {
      return {
        response: {
          captcha_bypass: false,
          cookie_expires_at: Date.now() + 86400000 * 365,
          created_at: Date.now() - 86400000,
          id: 'client_mock',
          last_active_session_id: null,
          last_authentication_strategy: null,
          object: 'client',
          sessions: [],
          sign_in: null,
          sign_up: null,
          updated_at: Date.now(),
        },
      };
    }

    const serializedSession = this.serialize(session);

    return {
      response: {
        captcha_bypass: false,
        cookie_expires_at: Date.now() + 86400000 * 365,
        created_at: Date.now() - 86400000,
        id: 'client_mock',
        last_active_session_id: session.id,
        last_authentication_strategy: null,
        object: 'client',
        sessions: [serializedSession],
        sign_in: null,
        sign_up: null,
        updated_at: Date.now(),
      },
    };
  }

  static handleTouch(session: SessionResource): ClientResponse {
    const now = new Date();

    session.abandonAt = new Date(now.getTime() + 86400000 * 30);
    session.expireAt = new Date(now.getTime() + 86400000 * 7);
    session.lastActiveAt = now;
    session.updatedAt = now;

    return {
      client: {
        captcha_bypass: false,
        cookie_expires_at: now.getTime() + 86400000 * 365,
        created_at: now.getTime() - 86400000,
        id: 'client_mock',
        last_active_session_id: session.id,
        last_authentication_strategy: null,
        object: 'client',
        sessions: [this.serialize(session)],
        sign_in: null,
        sign_up: null,
        updated_at: now.getTime(),
      },
      response: this.serialize(session),
    };
  }

  static getEndResponse(session: SessionResource): ClerkAPIResponse<SessionJSON> {
    return {
      response: {
        ...this.serialize(session),
        status: 'ended',
      },
    };
  }

  static getSessionResponse(session: SessionResource): ClerkAPIResponse<SessionJSON> {
    return {
      response: this.serialize(session),
    };
  }
}
