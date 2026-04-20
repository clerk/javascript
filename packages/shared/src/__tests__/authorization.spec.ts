import { describe, expect, it } from 'vitest';

import { createCheckAuthorization, splitByScope } from '../authorization';

describe('createCheckAuthorization', () => {
  it('correctly parses features', () => {
    const checkAuthorization = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'admin',
      orgPermissions: ['org:read'],
      features: 'o:reservations,u:dashboard',
      plans: 'free_user,plus_user',
      factorVerificationAge: [1000, 2000],
    });
    expect(checkAuthorization({ feature: 'o:reservations' })).toBe(true);
    expect(checkAuthorization({ feature: 'org:reservations' })).toBe(true);
    expect(checkAuthorization({ feature: 'organization:reservations' })).toBe(true);
    expect(checkAuthorization({ feature: 'reservations' })).toBe(true);
    expect(checkAuthorization({ feature: 'u:dashboard' })).toBe(true);
    expect(checkAuthorization({ feature: 'user:dashboard' })).toBe(true);
    expect(checkAuthorization({ feature: 'dashboard' })).toBe(true);

    expect(() => checkAuthorization({ feature: 'lol:dashboard' })).toThrow('Invalid scope: lol');
  });

  it('fails when no dimension was requested', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:sys_profile:delete'],
      features: 'o:premium',
      plans: 'plus',
      factorVerificationAge: [0, 0],
    });
    expect(has({} as any)).toBe(false);
  });

  it('fails permission + reverification when org context is missing', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: null,
      orgRole: null,
      orgPermissions: null,
      features: '',
      plans: '',
      factorVerificationAge: [0, 0],
    });
    expect(has({ permission: 'org:sys_profile:delete', reverification: 'strict' } as any)).toBe(false);
  });

  it('fails role + reverification when org context is missing', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: null,
      orgRole: null,
      orgPermissions: null,
      features: '',
      plans: '',
      factorVerificationAge: [0, 0],
    });
    expect(has({ role: 'org:admin', reverification: 'strict' } as any)).toBe(false);
  });

  it('fails reverification when factorVerificationAge is null (fva not opted-in)', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:sys_profile:delete'],
      features: '',
      plans: '',
      factorVerificationAge: null,
    });
    expect(has({ permission: 'org:sys_profile:delete', reverification: 'strict' } as any)).toBe(false);
  });

  it('fails when factorVerificationAge payload is malformed', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: null,
      orgRole: null,
      orgPermissions: null,
      features: '',
      plans: '',
      factorVerificationAge: ['0', '0'] as any,
    });
    expect(has({ reverification: 'strict_mfa' } as any)).toBe(false);
  });

  it('fails when reverification config is invalid', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:sys_profile:delete'],
      features: '',
      plans: '',
      factorVerificationAge: [0, 0],
    });
    expect(has({ permission: 'org:sys_profile:delete', reverification: 'invalid-value' } as any)).toBe(false);
  });

  it('requires AND across billing and org when both are requested', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:sys_memberships:read'],
      features: 'o:reservations',
      plans: '',
      factorVerificationAge: [0, 0],
    });
    // org permission denied + billing passes => overall denied (no OR coercion)
    expect(has({ permission: 'org:sys_profile:delete', feature: 'org:reservations' } as any)).toBe(false);
    // both pass
    expect(has({ permission: 'org:sys_memberships:read', feature: 'org:reservations' } as any)).toBe(true);
  });

  it('requires AND within org when both role and permission are requested', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:sys_memberships:read'],
      features: '',
      plans: '',
      factorVerificationAge: [0, 0],
    });
    // role matches, permission does not => denied
    expect(has({ role: 'org:admin', permission: 'org:sys_profile:delete' } as any)).toBe(false);
    // both match
    expect(has({ role: 'org:admin', permission: 'org:sys_memberships:read' } as any)).toBe(true);
  });

  it('requires AND within billing when both feature and plan are requested', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:read'],
      features: 'o:reservations',
      plans: 'u:plus',
      factorVerificationAge: [0, 0],
    });
    expect(has({ feature: 'org:reservations', plan: 'u:plus' } as any)).toBe(true);
    expect(has({ feature: 'org:reservations', plan: 'u:free' } as any)).toBe(false);
    expect(has({ feature: 'org:missing', plan: 'u:plus' } as any)).toBe(false);
  });

  it('fails feature check when features claim is missing or empty', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:read'],
      features: '',
      plans: '',
      factorVerificationAge: [0, 0],
    });
    expect(has({ feature: 'org:premium' })).toBe(false);
  });

  it('fails strict_mfa when the user has no second factor enrolled', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: null,
      orgRole: null,
      orgPermissions: null,
      features: '',
      plans: '',
      factorVerificationAge: [0, -1],
    });
    expect(has({ reverification: 'strict_mfa' })).toBe(false);
  });

  it('fails reverification when factor1Age is -1 (invalid state)', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: null,
      orgRole: null,
      orgPermissions: null,
      features: '',
      plans: '',
      factorVerificationAge: [-1, 0],
    });
    expect(has({ reverification: 'strict' } as any)).toBe(false);
  });

  it('fails when factor ages are negative non-sentinel values', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: null,
      orgRole: null,
      orgPermissions: null,
      features: '',
      plans: '',
      factorVerificationAge: [-0.5, 0],
    });
    expect(has({ reverification: 'strict' } as any)).toBe(false);
  });

  it('fails non-string role / permission / feature / plan values without throwing', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:sys_profile:delete'],
      features: 'o:premium',
      plans: 'u:plus',
      factorVerificationAge: [0, 0],
    });
    expect(has({ role: null as any })).toBe(false);
    expect(has({ permission: null as any })).toBe(false);
    expect(has({ feature: null as any })).toBe(false);
    expect(has({ plan: null as any })).toBe(false);
    expect(has({ role: 123 as any })).toBe(false);
    expect(has({ permission: 123 as any })).toBe(false);
  });

  it('fails reverification when config object is incomplete or out of range', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:sys_profile:delete'],
      features: '',
      plans: '',
      factorVerificationAge: [0, 0],
    });
    expect(has({ reverification: { level: 'multi_factor' } as any })).toBe(false);
    expect(has({ reverification: { level: 'multi_factor', afterMinutes: 0 } as any })).toBe(false);
    expect(has({ reverification: { level: 'multi_factor', afterMinutes: -1 } as any })).toBe(false);
  });

  it('requires AND for within-org role and permission (role fails, permission passes)', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:sys_memberships:read'],
      features: '',
      plans: '',
      factorVerificationAge: [0, 0],
    });
    // role does not match, but permission matches; AND requires both
    expect(has({ role: 'org:member', permission: 'org:sys_memberships:read' } as any)).toBe(false);
  });

  it('requires AND across org and billing with cross-dimension combos', () => {
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:sys_memberships:read'],
      features: 'o:reservations',
      plans: 'u:plus',
      factorVerificationAge: [0, 0],
    });
    // role matches, feature fails => denied
    expect(has({ role: 'org:admin', feature: 'org:missing' } as any)).toBe(false);
    // role matches, plan fails => denied
    expect(has({ role: 'org:admin', plan: 'u:free' } as any)).toBe(false);
    // role matches, feature matches => authorized
    expect(has({ role: 'org:admin', feature: 'org:reservations' } as any)).toBe(true);
  });

  it('fails missing features claim when combined with a passing reverification check', () => {
    // Directly exercises the primary bypass pattern via billing coercion: with the
    // pre-fix logic, `billing=fail` + `reverification=pass` would collapse via the
    // `||` short-circuit into a `pass`. The new combiner rejects it.
    const has = createCheckAuthorization({
      userId: 'user_123',
      orgId: 'org_123',
      orgRole: 'org:admin',
      orgPermissions: ['org:sys_profile:delete'],
      features: '',
      plans: '',
      factorVerificationAge: [0, 0],
    });
    expect(has({ feature: 'org:premium', reverification: 'strict' } as any)).toBe(false);
  });
});

describe('splitByScope', () => {
  it('correctly splits features by scope', () => {
    const { org, user } = splitByScope('o:reservations,u:dashboard');
    expect(org).toEqual(['reservations']);
    expect(user).toEqual(['dashboard']);
  });

  it('correctly splits features by scope with multiple scopes', () => {
    const { org, user } = splitByScope('o:reservations,u:dashboard,ou:support-chat,uo:billing');
    expect(org).toEqual(['reservations', 'support-chat', 'billing']);
    expect(user).toEqual(['dashboard', 'support-chat', 'billing']);
  });

  it('throws an error if the claim element is missing a colon', () => {
    expect(() => splitByScope('reservations,dashboard')).toThrow('Invalid claim element (missing colon): reservations');
  });
});
