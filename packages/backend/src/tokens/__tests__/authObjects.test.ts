import type { JwtPayload } from '@clerk/types';
import { describe, expect, it } from 'vitest';

import { mockTokens, mockVerificationResults } from '../../fixtures/machine';
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
      // @ts-expect-error - Testing
      expect(typeof serializableAuthObject[key]).not.toBe('function');
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
    it('has() for user scope', () => {
      const mockAuthenticateContext = { sessionToken: 'authContextToken' } as AuthenticateContext;

      const partialJwtPayload = {
        ___raw: 'raw',
        act: { sub: 'actor' },
        sid: 'sessionId',
        sub: 'userId',
      } as Partial<JwtPayload>;

      const authObject = signedInAuthObject(mockAuthenticateContext, 'token', partialJwtPayload as JwtPayload);

      expect(authObject.has({ role: 'org:admin' })).toBe(false);
      expect(authObject.has({ role: 'admin' })).toBe(false);
      expect(authObject.has({ permission: 'org:f1:read' })).toBe(false);
      expect(authObject.has({ permission: 'f1:read' })).toBe(false);
      expect(authObject.has({ feature: 'org:reservations' })).toBe(false);
      expect(authObject.has({ feature: 'org:impersonation' })).toBe(false);
    });

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
      expect(authObject.has({ role: 'admin' })).toBe(true);
      expect(authObject.has({ permission: 'org:f1:read' })).toBe(true);
      expect(authObject.has({ permission: 'f1:read' })).toBe(true);
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
      expect(authObject.has({ role: 'admin' })).toBe(true);
      expect(authObject.has({ permission: 'org:reservations:read' })).toBe(true);
      expect(authObject.has({ permission: 'reservations:read' })).toBe(true);
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
  const debugData = { foo: 'bar' };

  describe('API Key authentication', () => {
    const token = mockTokens.api_key;
    const verificationResult = mockVerificationResults.api_key;

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
      expect(authObject.scopes).toEqual(['read:foo', 'write:bar']);
      expect(authObject.claims).toEqual({ foo: 'bar' });
    });
  });

  describe('OAuth Access Token authentication', () => {
    const token = mockTokens.oauth_token;
    const verificationResult = mockVerificationResults.oauth_token;

    it('getToken returns the token passed in', async () => {
      const authObject = authenticatedMachineObject('oauth_token', token, verificationResult, debugData);
      const retrievedToken = await authObject.getToken();
      expect(retrievedToken).toBe(token);
    });

    it('has() always returns false', () => {
      const authObject = authenticatedMachineObject('oauth_token', token, verificationResult, debugData);
      expect(authObject.has({})).toBe(false);
    });

    it('properly initializes properties', () => {
      const authObject = authenticatedMachineObject('oauth_token', token, verificationResult, debugData);
      expect(authObject.tokenType).toBe('oauth_token');
      expect(authObject.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
      expect(authObject.scopes).toEqual(['read:foo', 'write:bar']);
    });
  });

  describe('Machine Token authentication', () => {
    const debugData = { foo: 'bar' };
    const token = mockTokens.machine_token;
    const verificationResult = mockVerificationResults.machine_token;

    it('getToken returns the token passed in', async () => {
      const authObject = authenticatedMachineObject('machine_token', token, verificationResult, debugData);
      const retrievedToken = await authObject.getToken();
      expect(retrievedToken).toBe(token);
    });

    it('has() always returns false', () => {
      const authObject = authenticatedMachineObject('machine_token', token, verificationResult, debugData);
      expect(authObject.has({})).toBe(false);
    });

    it('properly initializes properties', () => {
      const authObject = authenticatedMachineObject('machine_token', token, verificationResult, debugData);
      expect(authObject.tokenType).toBe('machine_token');
      expect(authObject.name).toBe('my-machine-token');
      expect(authObject.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
      expect(authObject.scopes).toEqual(['read:foo', 'write:bar']);
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
    expect(authObject.scopes).toBeNull();
    expect(authObject.claims).toBeNull();
  });

  it('has() always returns false', () => {
    const authObject = unauthenticatedMachineObject('machine_token');
    expect(authObject.has({})).toBe(false);
  });

  it('getToken always returns null ', async () => {
    const authObject = unauthenticatedMachineObject('machine_token');
    const retrievedToken = await authObject.getToken();
    expect(retrievedToken).toBeNull();
  });
});
