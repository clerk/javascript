import { describe, it, expect } from 'vitest';
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
