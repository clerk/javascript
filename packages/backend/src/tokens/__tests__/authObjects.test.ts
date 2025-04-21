import type { JwtPayload } from '@clerk/types';
import { describe, expect, it } from 'vitest';

import { ObjectType } from '../../api/resources/JSON';
import type { AuthenticateContext } from '../authenticateContext';
import {
  authenticatedMachineObject,
  makeAuthObjectSerializable,
  signedInAuthObject,
  signedOutAuthObject,
  unauthenticatedMachineObject,
} from '../authObjects';

describe('makeAuthObjectSerializable', () => {
  it('removes non-serializable props', () => {
    const authObject = signedOutAuthObject();
    const serializableAuthObject = makeAuthObjectSerializable(authObject);

    for (const key in serializableAuthObject) {
      expect(typeof serializableAuthObject[key as keyof typeof serializableAuthObject]).not.toBe('function');
    }
  });
});

describe('signedInAuthObject', () => {
  it('getToken returns the token passed in', async () => {
    const mockAuthenticateContext = { sessionToken: 'authContextToken' } as AuthenticateContext;
    const authObject = signedInAuthObject(mockAuthenticateContext, 'token', {
      act: 'actor',
      sid: 'sessionId',
      org_id: 'orgId',
      org_role: 'orgRole',
      org_slug: 'orgSlug',
      org_permissions: 'orgPermissions',
      sub: 'userId',
    } as unknown as JwtPayload);

    const token = await authObject.getToken();
    expect(token).toBe('token');
  });

  describe('JWT v1', () => {
    it('has() for orgs', () => {
      const mockAuthenticateContext = { sessionToken: 'authContextToken' } as AuthenticateContext;

      const partialJwtPayload = {
        ___raw: 'raw',
        act: { sub: 'actor' },
        sid: 'sessionId',
        org_id: 'orgId',
        org_role: 'org:admin',
        org_slug: 'orgSlug',
        org_permissions: ['org:f1:read', 'org:f2:manage'],
        sub: 'userId',
      } as Partial<JwtPayload>;

      const authObject = signedInAuthObject(mockAuthenticateContext, 'token', partialJwtPayload as JwtPayload);

      expect(authObject.has({ role: 'org:admin' })).toBe(true);
      expect(authObject.has({ permission: 'org:f1:read' })).toBe(true);
      expect(authObject.has({ permission: 'org:f1' })).toBe(false);
      expect(authObject.has({ permission: 'org:f2:manage' })).toBe(true);
      expect(authObject.has({ permission: 'org:f2' })).toBe(false);

      expect(authObject.has({ feature: 'org:reservations' })).toBe(false);
      expect(authObject.has({ feature: 'org:impersonation' })).toBe(false);
    });
  });

  describe('JWT v2', () => {
    it('has() for orgs', () => {
      const mockAuthenticateContext = { sessionToken: 'authContextToken' } as AuthenticateContext;

      const partialJwtPayload = {
        v: 2,
        ___raw: 'raw',
        act: { sub: 'actor' },
        sid: 'sessionId',
        fea: 'o:reservations,o:impersonation',
        o: {
          id: 'orgId',
          rol: 'admin',
          slg: 'orgSlug',
          per: 'read,manage',
          fpm: '3',
        },

        sub: 'userId',
      } as Partial<JwtPayload>;

      const authObject = signedInAuthObject(mockAuthenticateContext, 'token', partialJwtPayload as JwtPayload);

      expect(authObject.has({ role: 'org:admin' })).toBe(true);
      expect(authObject.has({ permission: 'org:reservations:read' })).toBe(true);
      expect(authObject.has({ permission: 'org:reservations' })).toBe(false);
      expect(authObject.has({ permission: 'org:reservations:manage' })).toBe(true);
      expect(authObject.has({ permission: 'org:reservations' })).toBe(false);
      expect(authObject.has({ permission: 'org:impersonation:read' })).toBe(false);
      expect(authObject.has({ permission: 'org:impersonation:manage' })).toBe(false);

      expect(authObject.has({ feature: 'org:reservations' })).toBe(true);
      expect(authObject.has({ feature: 'org:impersonation' })).toBe(true);
    });

    it('has() for billing with scopes', () => {
      const mockAuthenticateContext = { sessionToken: 'authContextToken' } as AuthenticateContext;

      const partialJwtPayload = {
        v: 2,
        ___raw: 'raw',
        act: { sub: 'actor' },
        sid: 'sessionId',
        fea: 'o:reservations,u:dashboard,uo:support-chat,o:impersonation',
        o: {
          id: 'orgId',
          rol: 'member',
          slg: 'orgSlug',
          per: 'read,manage',
          fpm: '2,3',
        },
        pla: 'u:pro,o:business',
        sub: 'userId',
      } as Partial<JwtPayload>;

      const authObject = signedInAuthObject(mockAuthenticateContext, 'token', partialJwtPayload as JwtPayload);

      expect(authObject.has({ permission: 'org:reservations:read' })).toBe(false);
      expect(authObject.has({ permission: 'org:reservations:manage' })).toBe(true);

      expect(authObject.has({ permission: 'org:support-chat:read' })).toBe(true);
      expect(authObject.has({ permission: 'org:support-chat:manage' })).toBe(true);

      expect(authObject.has({ permission: 'u:dashboard:manage' })).toBe(false);
      expect(authObject.has({ permission: 'u:dashboard:read' })).toBe(false);

      expect(authObject.has({ feature: 'org:reservations' })).toBe(true);
      expect(authObject.has({ feature: 'user:reservations' })).toBe(false);
      expect(authObject.has({ feature: 'org:impersonation' })).toBe(true);
      expect(authObject.has({ feature: 'user:impersonation' })).toBe(false);
      expect(authObject.has({ feature: 'org:dashboard' })).toBe(false);
      expect(authObject.has({ feature: 'user:dashboard' })).toBe(true);
      expect(authObject.has({ feature: 'org:support-chat' })).toBe(true);
      expect(authObject.has({ feature: 'user:support-chat' })).toBe(true);

      expect(authObject.has({ plan: 'org:business' })).toBe(true);
      expect(authObject.has({ plan: 'user:business' })).toBe(false);

      expect(authObject.has({ plan: 'org:pro' })).toBe(false);
      expect(authObject.has({ plan: 'user:pro' })).toBe(true);
    });

    it('has() for billing without scopes', () => {
      const mockAuthenticateContext = { sessionToken: 'authContextToken' } as AuthenticateContext;

      const partialJwtPayload = {
        v: 2,
        ___raw: 'raw',
        act: { sub: 'actor' },
        sid: 'sessionId',
        fea: 'o:reservations,u:dashboard,uo:support-chat,o:impersonation',
        o: {
          id: 'orgId',
          rol: 'member',
          slg: 'orgSlug',
          per: 'read,manage',
          fpm: '2,3',
        },
        pla: 'u:pro,o:business',
        sub: 'userId',
      } as Partial<JwtPayload>;

      const authObject = signedInAuthObject(mockAuthenticateContext, 'token', partialJwtPayload as JwtPayload);

      expect(authObject.has({ feature: 'reservations' })).toBe(true); // because the org has it.
      expect(authObject.has({ feature: 'dashboard' })).toBe(true); // because the user has it.
      expect(authObject.has({ feature: 'pro' })).toBe(false); // `pro` is a plan
      expect(authObject.has({ feature: 'impersonation' })).toBe(true); // because the org has it.

      expect(authObject.has({ plan: 'pro' })).toBe(true); // because the user has it.
      expect(authObject.has({ plan: 'business' })).toBe(true); // because the org has it.
    });
  });
});

describe('authenticatedMachineObject', () => {
  describe('API Key authentication', () => {
    const debugData = { foo: 'bar' };
    const token = 'api_key_LCWGdaM8mv8K4PC/57IICZQXAeWfCgF30DZaFXHoGn9=';
    const verificationResult = {
      object: ObjectType.ApiKey,
      id: 'api_key_ey966f1b1xf93586b2debdcadb0b3bd1',
      type: 'api_key',
      name: 'my-api-key',
      subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
      claims: { foo: 'bar' },
      createdBy: null,
      creationReason: 'For testing purposes',
      secondsUntilExpiration: null,
      createdAt: 1745185445567,
      expiresAt: 1745185445567,
    };

    it('getToken returns the token passed in', async () => {
      const authObject = authenticatedMachineObject('api_key', token, verificationResult, debugData);
      const retrievedToken = await authObject.getToken();
      expect(retrievedToken).toBe(token);
    });

    it('has() always returns false', () => {
      const authObject = authenticatedMachineObject('api_key', token, verificationResult, debugData);
      expect(authObject.has({})).toBe(false);
    });

    it('properly initializes properties', () => {
      const authObject = authenticatedMachineObject('api_key', token, verificationResult, debugData);
      expect(authObject.tokenType).toBe('api_key');
      expect(authObject.name).toBe('my-api-key');
      expect(authObject.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
      expect(authObject.claims).toEqual({ foo: 'bar' });
    });
  });

  describe('OAuth Access Token authentication', () => {
    const token = 'oauth_token_8XOIucKvqHVr5tYP123456789abcdefghij';
    const verificationResult = {
      object: ObjectType.IdpOAuthAccessToken,
      id: 'oauth_token_2VTWUzvGC5UhdJCNx6xG1D98edc',
      type: 'oauth:access_token',
      name: 'GitHub OAuth',
      subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
      claims: { scope: 'read write' },
      createdAt: 1744928754551,
      expiresAt: 1744928754551,
    };

    it('getToken returns the token passed in', async () => {
      const authObject = authenticatedMachineObject('oauth_token', token, verificationResult);
      const retrievedToken = await authObject.getToken();
      expect(retrievedToken).toBe(token);
    });

    it('has() always returns false', () => {
      const authObject = authenticatedMachineObject('oauth_token', token, verificationResult);
      expect(authObject.has({})).toBe(false);
    });

    it('properly initializes properties', () => {
      const authObject = authenticatedMachineObject('oauth_token', token, verificationResult);
      expect(authObject.tokenType).toBe('oauth_token');
      expect(authObject.name).toBe('GitHub OAuth');
      expect(authObject.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
      expect(authObject.claims).toEqual({ scope: 'read write' });
    });
  });

  describe('Machine Token authentication', () => {
    const token = 'oauth_8XOIucKvqHVr5tYP123456789abcdefghij';
    const verificationResult = {
      object: ObjectType.MachineToken,
      id: 'machine_token_ey966f1b1xf93586b2debdcadb0b3bd1',
      name: 'my-machine-token',
      subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
      claims: { foo: 'bar' },
      revoked: false,
      expired: false,
      expiration: 1745185445567,
      createdBy: null,
      creationReason: 'For testing purposes',
      createdAt: 1745185445567,
      updatedAt: 1745185445567,
    };

    it('getToken returns the token passed in', async () => {
      const authObject = authenticatedMachineObject('machine_token', token, verificationResult);
      const retrievedToken = await authObject.getToken();
      expect(retrievedToken).toBe(token);
    });

    it('has() always returns false', () => {
      const authObject = authenticatedMachineObject('machine_token', token, verificationResult);
      expect(authObject.has({})).toBe(false);
    });

    it('properly initializes properties', () => {
      const authObject = authenticatedMachineObject('machine_token', token, verificationResult);
      expect(authObject.tokenType).toBe('machine_token');
      expect(authObject.name).toBe('my-machine-token');
      expect(authObject.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
      expect(authObject.claims).toEqual({ foo: 'bar' });
    });
  });
});

describe('unauthenticatedMachineObject', () => {
  it('properly initializes properties', () => {
    const authObject = unauthenticatedMachineObject('machine_token');
    expect(authObject.tokenType).toBe('machine_token');
    expect(authObject.id).toBeNull();
    expect(authObject.name).toBeNull();
    expect(authObject.subject).toBeNull();
    expect(authObject.claims).toBeNull();
  });

  it('has() always returns false', () => {
    const authObject = unauthenticatedMachineObject('machine_token');
    expect(authObject.has()).toBe(false);
  });

  it('getToken always returns null ', async () => {
    const authObject = unauthenticatedMachineObject('machine_token');
    const retrievedToken = await authObject.getToken();
    expect(retrievedToken).toBeNull();
  });
});
