import { describe, expectTypeOf, it } from 'vitest';

import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from '../organizationMembership';
import type { CheckAuthorizationFromSessionClaims, CheckAuthorizationParamsFromSessionClaims } from '../session';

type ParamsOfHas = Parameters<CheckAuthorizationFromSessionClaims>[0];

describe('CheckAuthorizationFromSessionClaims', () => {
  it('has({}) is allowed', () => {
    expectTypeOf({} as const).toMatchTypeOf<ParamsOfHas>();
  });

  it('has({ role }) is allowed', () => {
    expectTypeOf({ role: 'org:admin' }).toMatchTypeOf<ParamsOfHas>();
  });

  it('has({ permission }) is allowed', () => {
    expectTypeOf({
      permission: 'org:feature:action',
    }).toMatchTypeOf<ParamsOfHas>();
  });

  it('has({ role, permission }) is NOT allowed', () => {
    expectTypeOf({
      role: 'org:admin',
      permission: 'org:feature:action',
    }).not.toMatchTypeOf<ParamsOfHas>();
  });

  it('accepts an explicit Role type parameter', () => {
    type RoleParams = CheckAuthorizationParamsFromSessionClaims<OrganizationCustomPermissionKey, 'org:admin'>;
    expectTypeOf({ role: 'org:admin' as const }).toMatchTypeOf<RoleParams>();
    expectTypeOf({
      role: 'org:member' as const,
    }).not.toMatchTypeOf<RoleParams>();
  });

  it('accepts an explicit Permission type parameter', () => {
    type PermissionParams = CheckAuthorizationParamsFromSessionClaims<'org:reports:read', OrganizationCustomRoleKey>;
    expectTypeOf({
      permission: 'org:reports:read' as const,
    }).toMatchTypeOf<PermissionParams>();
  });
});
