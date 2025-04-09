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
  test('produced auth object is the same for v1 and v2', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObjectV2 } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      v: 2,
      fea: 'o:impersonation',
      o: {
        id: 'org_xxxxxxx',
        rol: 'admin',
        slg: '/test',
        per: 'read,manage',
        fpm: '3',
      },
    });

    const { sessionClaims: v1Claims, ...signedInAuthObjectV1 } = JWTPayloadToAuthObjectProperties({
      ...baseClaims,
      org_id: 'org_xxxxxxx',
      org_role: 'org:admin',
      org_slug: '/test',
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
        slg: '/test',
        per: 'read,manage',
        fpm: '2,3',
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
        fpm: '2,3',
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
        fpm: '2,3,2',
      },
    });

    expect(signedInAuthObject.orgPermissions?.sort()).toEqual(
      ['org:impersonation:read', 'org:memberships:read', 'org:memberships:manage', 'org:feature3:read'].sort(),
    );
  });

  test('feature are user scoped only', () => {
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

    expect(signedInAuthObject.orgPermissions?.sort()).toEqual([]);
  });
});
