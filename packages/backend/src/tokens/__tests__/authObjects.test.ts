import type { JwtPayload } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { createBackendApiClient } from '../../api/factory';
import { mockTokens, mockVerificationResults } from '../../fixtures/machine';
import type { AuthenticateContext } from '../authenticateContext';
import type { InvalidTokenAuthObject, UnauthenticatedMachineObject } from '../authObjects';
import {
  authenticatedMachineObject,
  getAuthObjectForAcceptedToken,
  makeAuthObjectSerializable,
  signedInAuthObject,
  signedOutAuthObject,
  unauthenticatedMachineObject,
} from '../authObjects';

vi.mock('../../api/factory', () => ({
  createBackendApiClient: vi.fn(),
}));

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

    it('has() for orgs for old `admin` role', () => {
      const mockAuthenticateContext = { sessionToken: 'authContextToken' } as AuthenticateContext;

      const partialJwtPayload = {
        ___raw: 'raw',
        act: { sub: 'actor' },
        sid: 'sessionId',
        org_id: 'orgId',
        org_role: 'admin',
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

    // This state should not happen since the JWT v2 payload is normalized to remove the `org:` prefix from o.rol.
    it('has() for orgs with `org:` prefix in role', () => {
      const mockAuthenticateContext = { sessionToken: 'authContextToken' } as AuthenticateContext;

      const partialJwtPayload = {
        v: 2,
        ___raw: 'raw',
        act: { sub: 'actor' },
        sid: 'sessionId',
        fea: 'o:reservations,o:impersonation',
        o: {
          id: 'orgId',
          rol: 'org:admin',
          slg: 'orgSlug',
          per: 'read,manage',
          fpm: '3',
        },

        sub: 'userId',
      } as Partial<JwtPayload>;

      const authObject = signedInAuthObject(mockAuthenticateContext, 'token', partialJwtPayload as JwtPayload);

      expect(authObject.has({ role: 'org:admin' })).toBe(true);
      expect(authObject.has({ role: 'admin' })).toBe(true);
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

    it('properly initializes properties (user)', () => {
      const authObject = authenticatedMachineObject('api_key', token, verificationResult, debugData);
      expect(authObject.tokenType).toBe('api_key');
      expect(authObject.id).toBe('ak_ey966f1b1xf93586b2debdcadb0b3bd1');
      expect(authObject.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
      expect(authObject.scopes).toEqual(['read:foo', 'write:bar']);
      expect(authObject.claims).toEqual({ foo: 'bar' });
      expect(authObject.userId).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
      expect(authObject.orgId).toBeNull();
    });

    it('properly initializes properties (org)', () => {
      const authObject = authenticatedMachineObject(
        'api_key',
        token,
        {
          ...verificationResult,
          subject: 'org_2vYVtestTESTtestTESTtestTESTtest',
        },
        debugData,
      );
      expect(authObject.tokenType).toBe('api_key');
      expect(authObject.id).toBe('ak_ey966f1b1xf93586b2debdcadb0b3bd1');
      expect(authObject.subject).toBe('org_2vYVtestTESTtestTESTtestTESTtest');
      expect(authObject.scopes).toEqual(['read:foo', 'write:bar']);
      expect(authObject.claims).toEqual({ foo: 'bar' });
      expect(authObject.userId).toBeNull();
      expect(authObject.orgId).toBe('org_2vYVtestTESTtestTESTtestTESTtest');
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
      expect(authObject.id).toBe('oat_2VTWUzvGC5UhdJCNx6xG1D98edc');
      expect(authObject.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
      expect(authObject.scopes).toEqual(['read:foo', 'write:bar']);
      expect(authObject.userId).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
      expect(authObject.clientId).toBe('client_2VTWUzvGC5UhdJCNx6xG1D98edc');
    });
  });

  describe('Machine Token authentication', () => {
    const debugData = { foo: 'bar' };
    const token = mockTokens.m2m_token;
    const verificationResult = mockVerificationResults.m2m_token;

    it('getToken returns the token passed in', async () => {
      const authObject = authenticatedMachineObject('m2m_token', token, verificationResult, debugData);
      const retrievedToken = await authObject.getToken();
      expect(retrievedToken).toBe(token);
    });

    it('has() always returns false', () => {
      const authObject = authenticatedMachineObject('m2m_token', token, verificationResult, debugData);
      expect(authObject.has({})).toBe(false);
    });

    it('properly initializes properties', () => {
      const authObject = authenticatedMachineObject('m2m_token', token, verificationResult, debugData);
      expect(authObject.tokenType).toBe('m2m_token');
      expect(authObject.id).toBe('m2m_ey966f1b1xf93586b2debdcadb0b3bd1');
      expect(authObject.subject).toBe('mch_2vYVtestTESTtestTESTtestTESTtest');
      expect(authObject.scopes).toEqual(['mch_1xxxxx', 'mch_2xxxxx']);
      expect(authObject.machineId).toBe('mch_2vYVtestTESTtestTESTtestTESTtest');
    });
  });
});

describe('unauthenticatedMachineObject', () => {
  it('properly initializes properties', () => {
    const authObject = unauthenticatedMachineObject('m2m_token');
    expect(authObject.tokenType).toBe('m2m_token');
    expect(authObject.id).toBeNull();
    expect(authObject.subject).toBeNull();
    expect(authObject.scopes).toBeNull();
  });

  it('has() always returns false', () => {
    const authObject = unauthenticatedMachineObject('m2m_token');
    expect(authObject.has({})).toBe(false);
  });

  it('getToken always returns null ', async () => {
    const authObject = unauthenticatedMachineObject('m2m_token');
    const retrievedToken = await authObject.getToken();
    expect(retrievedToken).toBeNull();
  });
});

describe('getAuthObjectForAcceptedToken', () => {
  const debugData = { foo: 'bar' };
  const sessionAuth = signedOutAuthObject(debugData);
  const machineAuth = authenticatedMachineObject('api_key', 'ak_xxx', mockVerificationResults.api_key, debugData);

  it('returns original object if acceptsToken is "any"', () => {
    const result = getAuthObjectForAcceptedToken({ authObject: machineAuth, acceptsToken: 'any' });
    expect(result).toBe(machineAuth);
  });

  it('returns original object if token type matches', () => {
    const result = getAuthObjectForAcceptedToken({ authObject: machineAuth, acceptsToken: 'api_key' });
    expect(result).toBe(machineAuth);
  });

  it('returns InvalidTokenAuthObject if acceptsToken is array and token type does not match', () => {
    const result = getAuthObjectForAcceptedToken({
      authObject: machineAuth,
      acceptsToken: ['m2m_token', 'oauth_token'],
    });
    expect((result as InvalidTokenAuthObject).tokenType).toBeNull();
    expect((result as InvalidTokenAuthObject).isAuthenticated).toBe(false);
  });

  it('returns InvalidTokenAuthObject if parsed type is not a machine token and does not match any in acceptsToken array', () => {
    const result = getAuthObjectForAcceptedToken({ authObject: sessionAuth, acceptsToken: ['api_key', 'oauth_token'] });
    expect((result as InvalidTokenAuthObject).tokenType).toBeNull();
    expect((result as InvalidTokenAuthObject).isAuthenticated).toBe(false);
  });

  it('returns signed-out session object if parsed type is not a machine token and does not match', () => {
    const result = getAuthObjectForAcceptedToken({ authObject: sessionAuth, acceptsToken: ['api_key', 'oauth_token'] });
    expect((result as InvalidTokenAuthObject).tokenType).toBeNull();
    expect((result as InvalidTokenAuthObject).isAuthenticated).toBe(false);
  });

  it('returns unauthenticated object for requested type if acceptsToken is a single value and does not match', () => {
    const result = getAuthObjectForAcceptedToken({ authObject: machineAuth, acceptsToken: 'm2m_token' });
    expect((result as UnauthenticatedMachineObject<'m2m_token'>).tokenType).toBe('m2m_token');
    expect((result as UnauthenticatedMachineObject<'m2m_token'>).id).toBeNull();
  });
});

describe('getToken with expiresInSeconds support', () => {
  it('calls fetcher with expiresInSeconds when template is provided', async () => {
    const mockGetToken = vi.fn().mockResolvedValue({ jwt: 'mocked-jwt-token' });
    const mockApiClient = {
      sessions: {
        getToken: mockGetToken,
      },
    };

    vi.mocked(createBackendApiClient).mockReturnValue(mockApiClient as any);

    const mockAuthenticateContext = {
      secretKey: 'sk_test_123',
    } as AuthenticateContext;

    const authObject = signedInAuthObject(mockAuthenticateContext, 'raw-session-token', {
      sid: 'sess_123',
      sub: 'user_123',
    } as unknown as JwtPayload);

    const result = await authObject.getToken({ template: 'custom-template', expiresInSeconds: 3600 });

    expect(mockGetToken).toHaveBeenCalledWith('sess_123', 'custom-template', 3600);
    expect(result).toBe('mocked-jwt-token');
  });

  it('calls fetcher without expiresInSeconds when template is provided but expiresInSeconds is undefined', async () => {
    const mockGetToken = vi.fn().mockResolvedValue({ jwt: 'mocked-jwt-token' });
    const mockApiClient = {
      sessions: {
        getToken: mockGetToken,
      },
    };

    vi.mocked(createBackendApiClient).mockReturnValue(mockApiClient as any);

    const mockAuthenticateContext = {
      secretKey: 'sk_test_123',
    } as AuthenticateContext;

    const authObject = signedInAuthObject(mockAuthenticateContext, 'raw-session-token', {
      sid: 'sess_123',
      sub: 'user_123',
    } as unknown as JwtPayload);

    const result = await authObject.getToken({ template: 'custom-template' });

    expect(mockGetToken).toHaveBeenCalledWith('sess_123', 'custom-template', undefined);
    expect(result).toBe('mocked-jwt-token');
  });

  it('returns raw session token when no template is provided', async () => {
    const mockGetToken = vi.fn();
    const mockApiClient = {
      sessions: {
        getToken: mockGetToken,
      },
    };

    vi.mocked(createBackendApiClient).mockReturnValue(mockApiClient as any);

    const mockAuthenticateContext = {
      secretKey: 'sk_test_123',
    } as AuthenticateContext;

    const authObject = signedInAuthObject(mockAuthenticateContext, 'raw-session-token', {
      sid: 'sess_123',
      sub: 'user_123',
    } as unknown as JwtPayload);

    const result = await authObject.getToken({});

    expect(mockGetToken).not.toHaveBeenCalled();
    expect(result).toBe('raw-session-token');
  });
});
