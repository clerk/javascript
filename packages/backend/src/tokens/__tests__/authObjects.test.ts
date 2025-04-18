import type { JwtPayload } from '@clerk/types';
import { describe, expect, it } from 'vitest';

import { APIKey, IdPOAuthAccessToken, MachineToken } from '../../api';
import { ObjectType } from '../../api/resources/JSON';
import type { AuthenticateContext } from '../authenticateContext';
import type {
  AuthenticatedAPIKeyObject,
  AuthenticatedMachineTokenObject,
  AuthenticatedOAuthTokenObject,
  UnauthenticatedAPIKeyObject,
  UnauthenticatedMachineTokenObject,
  UnauthenticatedOAuthTokenObject,
} from '../authObjects';
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
  it('returns correct AuthenticatedAPIKeyObject', async () => {
    const debugData = { foo: 'bar' };
    const apiKeyJson = {
      object: ObjectType.ApiKey,
      id: 'id1',
      type: 'key_type',
      name: 'key_name',
      subject: 'subject1',
      claims: { a: 'b' },
      created_by: 'creator1',
      creation_reason: 'reason1',
      seconds_until_expiration: 3600,
      created_at: 1000,
      expires_at: 2000,
    };
    const apiKey = APIKey.fromJSON(apiKeyJson);
    const obj = authenticatedMachineObject('api_key', 'token_string', apiKey, debugData);
    const apiKeyObj = obj as AuthenticatedAPIKeyObject;
    expect(apiKeyObj.tokenType).toBe('api_key');
    expect(await apiKeyObj.getToken()).toBe('token_string');
    expect(apiKeyObj.name).toBe(apiKey.name);
    expect(apiKeyObj.subject).toBe(apiKey.subject);
    expect(apiKeyObj.claims).toEqual(apiKey.claims);
    expect(apiKeyObj.createdAt).toBe(apiKey.createdAt);
    expect(apiKeyObj.type).toBe(apiKey.type);
    expect(apiKeyObj.createdBy).toBe(apiKey.createdBy);
    expect(apiKeyObj.creationReason).toBe(apiKey.creationReason);
    expect(apiKeyObj.secondsUntilExpiration).toBe(apiKey.secondsUntilExpiration);
    expect(apiKeyObj.expiresAt).toBe(apiKey.expiresAt);
    expect(apiKeyObj.has({})).toBe(false);
    expect(apiKeyObj.debug()).toMatchObject({ foo: 'bar' });
  });

  it('returns correct AuthenticatedOAuthTokenObject', async () => {
    const debugData = { foo: 'baz' };
    const oauthJson = {
      object: ObjectType.IdpOAuthAccessToken,
      id: 'id2',
      type: 'oauth_type',
      name: 'oauth_name',
      subject: 'subject2',
      claims: { x: 'y' },
      created_at: 2000,
      expires_at: 3000,
    };
    const oauthToken = IdPOAuthAccessToken.fromJSON(oauthJson);
    const obj = authenticatedMachineObject('oauth_token', 'oauth_token_string', oauthToken, debugData);
    const oauthObj = obj as AuthenticatedOAuthTokenObject;
    expect(oauthObj.tokenType).toBe('oauth_token');
    expect(await oauthObj.getToken()).toBe('oauth_token_string');
    expect(oauthObj.name).toBe(oauthToken.name);
    expect(oauthObj.subject).toBe(oauthToken.subject);
    expect(oauthObj.claims).toEqual(oauthToken.claims);
    expect(oauthObj.createdAt).toBe(oauthToken.createdAt);
    expect(oauthObj.type).toBe(oauthToken.type);
    expect(oauthObj.expiresAt).toBe(oauthToken.expiresAt);
    expect(oauthObj.has({})).toBe(false);
    expect(oauthObj.debug()).toMatchObject({ foo: 'baz' });
  });

  it('returns correct AuthenticatedMachineTokenObject', async () => {
    const debugData = { foo: 'qux' };
    const machineJson = {
      object: ObjectType.MachineToken,
      id: 'id3',
      name: 'machine_name',
      subject: 'subject3',
      claims: { c: 'd' },
      revoked: false,
      expired: false,
      expiration: 4000,
      created_by: 'creator3',
      creation_reason: 'reason3',
      created_at: 3000,
      updated_at: 4500,
    };
    const machineToken = MachineToken.fromJSON(machineJson);
    const obj = authenticatedMachineObject('machine_token', 'machine_token_string', machineToken, debugData);
    const machineObj = obj as AuthenticatedMachineTokenObject;
    expect(machineObj.tokenType).toBe('machine_token');
    expect(await machineObj.getToken()).toBe('machine_token_string');
    expect(machineObj.name).toBe(machineToken.name);
    expect(machineObj.subject).toBe(machineToken.subject);
    expect(machineObj.claims).toEqual(machineToken.claims);
    expect(machineObj.createdAt).toBe(machineToken.createdAt);
    expect(machineObj.revoked).toBe(machineToken.revoked);
    expect(machineObj.expired).toBe(machineToken.expired);
    expect(machineObj.expiration).toBe(machineToken.expiration);
    expect(machineObj.createdBy).toBe(machineToken.createdBy);
    expect(machineObj.creationReason).toBe(machineToken.creationReason);
    expect(machineObj.updatedAt).toBe(machineToken.updatedAt);
    expect(machineObj.has({})).toBe(false);
    expect(machineObj.debug()).toMatchObject({ foo: 'qux' });
  });
});

describe('unauthenticatedMachineObject', () => {
  it('returns correct UnauthenticatedAPIKeyObject', async () => {
    const debugData = { foo: 'bar' };
    const obj = unauthenticatedMachineObject('api_key', debugData);
    const unauthApiObj = obj as UnauthenticatedAPIKeyObject;
    expect(unauthApiObj.tokenType).toBe('api_key');
    expect(await unauthApiObj.getToken()).toBeNull();
    expect(unauthApiObj.name).toBeNull();
    expect(unauthApiObj.subject).toBeNull();
    expect(unauthApiObj.claims).toBeNull();
    expect(unauthApiObj.createdAt).toBeNull();
    expect(unauthApiObj.type).toBeNull();
    expect(unauthApiObj.createdBy).toBeNull();
    expect(unauthApiObj.creationReason).toBeNull();
    expect(unauthApiObj.secondsUntilExpiration).toBeNull();
    expect(unauthApiObj.expiresAt).toBeNull();
    expect(unauthApiObj.has({})).toBe(false);
    expect(unauthApiObj.debug()).toMatchObject({ foo: 'bar' });
  });

  it('returns correct UnauthenticatedOAuthTokenObject', async () => {
    const debugData = { foo: 'baz' };
    const obj = unauthenticatedMachineObject('oauth_token', debugData);
    const unauthOAuthObj = obj as UnauthenticatedOAuthTokenObject;
    expect(unauthOAuthObj.tokenType).toBe('oauth_token');
    expect(await unauthOAuthObj.getToken()).toBeNull();
    expect(unauthOAuthObj.name).toBeNull();
    expect(unauthOAuthObj.subject).toBeNull();
    expect(unauthOAuthObj.claims).toBeNull();
    expect(unauthOAuthObj.createdAt).toBeNull();
    expect(unauthOAuthObj.type).toBeNull();
    expect(unauthOAuthObj.expiresAt).toBeNull();
    expect(unauthOAuthObj.has({})).toBe(false);
    expect(unauthOAuthObj.debug()).toMatchObject({ foo: 'baz' });
  });

  it('returns correct UnauthenticatedMachineTokenObject', async () => {
    const debugData = { foo: 'quux' };
    const obj = unauthenticatedMachineObject('machine_token', debugData);
    const unauthMachineObj = obj as UnauthenticatedMachineTokenObject;
    expect(unauthMachineObj.tokenType).toBe('machine_token');
    expect(await unauthMachineObj.getToken()).toBeNull();
    expect(unauthMachineObj.name).toBeNull();
    expect(unauthMachineObj.subject).toBeNull();
    expect(unauthMachineObj.claims).toBeNull();
    expect(unauthMachineObj.createdAt).toBeNull();
    expect(unauthMachineObj.revoked).toBeNull();
    expect(unauthMachineObj.expired).toBeNull();
    expect(unauthMachineObj.expiration).toBeNull();
    expect(unauthMachineObj.createdBy).toBeNull();
    expect(unauthMachineObj.creationReason).toBeNull();
    expect(unauthMachineObj.updatedAt).toBeNull();
    expect(unauthMachineObj.has({})).toBe(false);
    expect(unauthMachineObj.debug()).toMatchObject({ foo: 'quux' });
  });
});
