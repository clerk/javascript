import type { JwtPayload } from '@clerk/types';
import { describe, expect, it } from 'vitest';

import type { AuthenticateContext } from '../authenticateContext';
import { makeAuthObjectSerializable, signedInAuthObject, signedOutAuthObject } from '../authObjects';

describe('makeAuthObjectSerializable', () => {
  it('removes non-serializable props', () => {
    const authObject = signedOutAuthObject();
    const serializableAuthObject = makeAuthObjectSerializable(authObject);

    for (const key in serializableAuthObject) {
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
