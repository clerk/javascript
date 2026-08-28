import { describe, expect, it } from 'vitest';

import { resolveUserButtonLayout } from '../user-button.layout';
import type { UserButtonData, UserButtonMode, UserButtonModePriority } from '../user-button.types';

const alice = { sessionId: 'sess_1', name: 'Alice Smith', identifier: 'alice@example.com' };
const bob = { sessionId: 'sess_2', name: 'Bob Jones', identifier: 'bob@example.com' };
const foundry = { kind: 'membership', organizationId: 'org_1', name: 'Foundry' } as const;

function resolve(
  mode: UserButtonMode,
  data: Partial<UserButtonData> = {},
  modePriority: UserButtonModePriority = 'organization',
) {
  return resolveUserButtonLayout(mode, modePriority, {
    activeSession: alice,
    activeOrganization: foundry,
    hasOrganizations: true,
    memberships: [foundry],
    suggestions: [],
    invitations: [],
    additionalSessions: [bob],
    ...data,
  });
}

describe('resolveUserButtonLayout, where each action lands', () => {
  it('spreads them across all four slots in combined mode', () => {
    expect(resolve('combined').actions).toEqual({
      header: ['inviteMembers', 'manageLead'],
      organizationsHeading: ['createOrganization', 'manageAccount', 'signOut'],
      organizationsFooter: ['createOrganization'],
      footer: ['switchAccount', 'signOutAll'],
    });
  });

  it('carries no account actions at all in organization mode', () => {
    expect(resolve('organization').actions).toEqual({
      header: ['inviteMembers', 'manageLead'],
      organizationsHeading: [],
      organizationsFooter: ['createOrganization'],
      footer: [],
    });
  });

  it('takes the account actions into the header and the foot in user mode', () => {
    expect(resolve('user').actions).toEqual({
      header: ['signOut', 'manageLead'],
      organizationsHeading: [],
      organizationsFooter: [],
      footer: ['switchAccount', 'signOutAll'],
    });
  });
});

describe('resolveUserButtonLayout, what the data settles', () => {
  it('offers no invitation where no organization is active', () => {
    expect(resolve('combined', { activeOrganization: null }).actions.header).toEqual(['manageLead']);
  });

  // With no second account the flyout would open onto one row, so the foot offers that row instead.
  // "All accounts" is that one account too, and the account's own row already signs out of it.
  it.each<UserButtonMode>(['combined', 'user'])(
    'leaves the foot "Add account" alone in %s mode where there is one account',
    mode => {
      expect(resolve(mode, { additionalSessions: [] }).actions.footer).toEqual(['addAccount']);
    },
  );
});

describe('resolveUserButtonLayout, which sections render', () => {
  it('heads the organizations with the account even where it belongs to none', () => {
    const layout = resolve('combined', { hasOrganizations: false, memberships: [], activeOrganization: null });

    expect(layout.showOrganizationsHeading).toBe(true);
    expect(layout.showOrganizations).toBe(false);
  });

  it('counts an invitation or a suggestion as something to list', () => {
    const invitation = {
      kind: 'invitation',
      id: 'inv_1',
      organizationId: 'org_2',
      organizationName: 'Other Co',
      status: 'pending',
    } as const;
    const data = { hasOrganizations: false, memberships: [], activeOrganization: null };

    expect(resolve('combined', data).showOrganizations).toBe(false);
    expect(resolve('combined', { ...data, invitations: [invitation] }).showOrganizations).toBe(true);
  });

  it('carries no organizations in user mode', () => {
    expect(resolve('user')).toMatchObject({ showOrganizations: false, showOrganizationsHeading: false });
  });
});

describe('resolveUserButtonLayout, what the surface leads with', () => {
  it('takes the priority only where there are two things to choose between', () => {
    expect(resolve('combined', {}, 'user').leadWith).toBe('user');
    expect(resolve('combined', {}, 'organization').leadWith).toBe('organization');
    expect(resolve('organization', {}, 'user').leadWith).toBe('organization');
    expect(resolve('user', {}, 'organization').leadWith).toBe('user');
  });
});
