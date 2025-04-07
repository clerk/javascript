import { __experimental_resolveSignedInAuthStateFromJWTClaims as resolveSignedInAuthStateFromJWTClaims } from '../authorization';

describe('resolveSignedInAuthStateFromJWTClaims', () => {
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

  test('produced auth object with v2 matches v1', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObjectV2 } = resolveSignedInAuthStateFromJWTClaims({
      ...baseClaims,
      v: 2,
      org: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
        per: 'permission1,permission2',
      },
    });

    const { sessionClaims: v1Claims, ...signedInAuthObjectV1 } = resolveSignedInAuthStateFromJWTClaims({
      ...baseClaims,
      org_id: 'org_id',
      org_role: 'admin',
      org_slug: 'org_slug',
      org_permissions: ['permission1', 'permission2'],
    });
    expect(signedInAuthObjectV1).toEqual(signedInAuthObjectV2);
  });

  test('produced auth object with v2 matches v1 without having orgs related claims', () => {
    const { sessionClaims: v2Claims, ...signedInAuthObjectV2 } = resolveSignedInAuthStateFromJWTClaims({
      ...baseClaims,
      v: 2,
    });

    const { sessionClaims: v1Claims, ...signedInAuthObjectV1 } = resolveSignedInAuthStateFromJWTClaims({
      ...baseClaims,
    });
    expect(signedInAuthObjectV1).toEqual(signedInAuthObjectV2);
  });

  test('v2 org permissions are splitted correctly', () => {
    const authObject = resolveSignedInAuthStateFromJWTClaims({
      ...baseClaims,
      v: 2,
      org: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
        per: 'permission1,permission2',
      },
    });
    expect(authObject.orgPermissions).toEqual(['permission1', 'permission2']);

    const authObject2 = resolveSignedInAuthStateFromJWTClaims({
      ...baseClaims,
      v: 2,
      org: {
        id: 'org_id',
        rol: 'admin',
        slg: 'org_slug',
        per: 'permission1',
      },
    });
    expect(authObject2.orgPermissions).toEqual(['permission1']);
  });
});
