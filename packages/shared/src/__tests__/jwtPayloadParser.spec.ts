import { describe, expect, test } from 'vitest';

import { splitByScope } from '../authorization';
import { __experimental_JWTPayloadToAuthObjectProperties as JWTPayloadToAuthObjectProperties } from '../jwtPayloadParser';

const baseClaims = {
  exp: 1234567890,
  iat: 1234567890,
  iss: 'https://api.clerk.com',
  sub: 'sub',
  sid: 'sid',
  azp: 'azp',
  nbf: 1234567890,
  __raw: '',
};

describe('JWTPayloadToAuthObjectProperties', () => {
  test('auth object with JWT v2 does not produces anything org related if there is no org active', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObjectV2 } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'u:impersonation,u:memberships',
    });

    const { sessionClaims: v1Claims, ...signedInAuthObjectV1 } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
    });
    expect(signedInAuthObjectV1).toEqual(signedInAuthObjectV2);
    expect(signedInAuthObjectV1.orgId).toBeUndefined();
    expect(signedInAuthObjectV1.orgPermissions).toBeUndefined();
    expect(signedInAuthObjectV1.orgRole).toBeUndefined();
    expect(signedInAuthObjectV1.orgSlug).toBeUndefined();
  });

  test('produced auth object is the same for v1 and v2', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObjectV2 } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'o:impersonation',
      o: {
        id: 'org_xxxxxxx',
        rol: 'admin',
        slg: 'org_test',
        per: 'read,manage',
        fpm: '3',
      },
    });

    const { sessionClaims: v1Claims, ...signedInAuthObjectV1 } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      org_id: 'org_xxxxxxx',
      org_role: 'org:admin',
      org_slug: 'org_test',
      org_permissions: ['org:impersonation:read', 'org:impersonation:manage'],
    });
    expect(signedInAuthObjectV1).toEqual(signedInAuthObjectV2);
  });

  test('org permissions are generated correctly when fea, per, and fpm are present', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObject } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'o:impersonation,o:memberships',
      o: {
        id: 'org_xxxxxxx',
        rol: 'admin',
        slg: 'org_test',
        per: 'read,manage',
        fpm: '1,3',
      },
    });

    expect(signedInAuthObject.orgPermissions?.sort()).toEqual(
      ['org:impersonation:read', 'org:memberships:read', 'org:memberships:manage'].sort(),
    );
  });

  test('if a feature is not mapped to any permissions it is added as is to the orgPermissions array', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObject } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'o:impersonation,o:memberships,o:feature3',
      o: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
        per: 'read,manage',
        fpm: '1,3',
      },
    });

    expect(signedInAuthObject.orgPermissions?.sort()).toEqual(
      ['org:impersonation:read', 'org:memberships:read', 'org:memberships:manage'].sort(),
    );
  });

  test('includes both org and user scoped features', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObject } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'uo:impersonation,o:memberships,uo:feature3',
      o: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
        per: 'read,manage',
        fpm: '1,3,1',
      },
    });

    expect(signedInAuthObject.orgPermissions?.sort()).toEqual(
      ['org:impersonation:read', 'org:memberships:read', 'org:memberships:manage', 'org:feature3:read'].sort(),
    );
  });

  test('if there is no o.fpm and o.per org permissions should be empty arrat', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObject } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'u:impersonation,u:memberships,u:feature3',
      o: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
      },
    });

    expect(signedInAuthObject.orgPermissions).toEqual([]);
  });

  test('org role is prefixed with org:', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObject } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'u:impersonation,u:memberships,u:feature3',
      o: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
      },
    });

    expect(signedInAuthObject.orgRole).toBe('org:admin');
  });

  test('org permissions are constructed correctly', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObject } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'ou:memberships,u:impersonation',
      o: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
        per: 'read,manage',
        fpm: '3',
      },
    });

    expect(signedInAuthObject.orgPermissions?.sort()).toEqual(
      ['org:memberships:read', 'org:memberships:manage'].sort(),
    );
  });

  test('org permissions are constructed correctly case 2', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObject } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'o:billing,o:email,o:fraud,o:instance,o:staging_plans',
      o: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
        per: 'manage,read',
        fpm: '3,3,3,3,1',
      },
    });

    expect(signedInAuthObject.orgPermissions?.sort()).toEqual(
      [
        'org:billing:manage',
        'org:billing:read',
        'org:email:manage',
        'org:email:read',
        'org:fraud:manage',
        'org:fraud:read',
        'org:instance:manage',
        'org:instance:read',
        'org:staging_plans:manage',
      ].sort(),
    );
  });

  test('org permissions are constructed correctly case 3', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObject } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'o:repositories,o:projects',
      o: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
        per: 'read,create,update,delete,revoke',
        fpm: '7,21',
      },
    });

    expect(signedInAuthObject.orgPermissions?.sort()).toEqual(
      [
        'org:repositories:read',
        'org:repositories:create',
        'org:repositories:update',
        'org:projects:read',
        'org:projects:update',
        'org:projects:revoke',
      ].sort(),
    );
  });

  test('org permissions are constructed correctly case 4', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObject } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'o:repositories,o:projects,o:webhooks,o:impersonation',
      o: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
        per: 'read,manage',
        fpm: '1,2,3',
      },
    });

    expect(signedInAuthObject.orgPermissions?.sort()).toEqual(
      ['org:repositories:read', 'org:projects:manage', 'org:webhooks:read', 'org:webhooks:manage'].sort(),
    );
  });

  test('org permissions are constructed correctly case 5', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObject } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'o:repositories,uo:projects,u:goldprofileborder',
      o: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
        per: 'read,create,update,delete,revoke',
        fpm: '7,21',
      },
    });

    expect(signedInAuthObject.orgPermissions?.sort()).toEqual(
      [
        'org:repositories:read',
        'org:repositories:create',
        'org:repositories:update',
        'org:projects:read',
        'org:projects:update',
        'org:projects:revoke',
      ].sort(),
    );
  });
});

describe('splitByScope ', () => {
  test('returns empty array when no features are present', () => {
    const { org } = splitByScope('');
    expect(org).toEqual([]);
  });

  test('only org features included', () => {
    const { org, user } = splitByScope('o:impersonation,o:payments');
    expect(org).toEqual(['impersonation', 'payments']);

    expect(user).toEqual([]);
  });

  test('only user features included', () => {
    const { org, user } = splitByScope('u:impersonation,u:payments');
    expect(org).toEqual([]);

    expect(user).toEqual(['impersonation', 'payments']);
  });

  test('both org and user features included', () => {
    const { org, user } = splitByScope('o:payments,u:impersonation');
    expect(org).toEqual(['payments']);

    expect(user).toEqual(['impersonation']);
  });

  test('features have multiple scopes', () => {
    const { org, user } = splitByScope('ou:payments,u:impersonation');
    expect(org).toEqual(['payments']);

    expect(user).toEqual(['payments', 'impersonation']);
  });
});
