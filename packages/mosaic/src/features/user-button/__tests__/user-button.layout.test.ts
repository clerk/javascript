import { describe, expect, it } from 'vitest';

import { resolveUserButtonLayout } from '../user-button.layout';
import type { UserButtonData, UserButtonMode } from '../user-button.types';

const alice = { sessionId: 'sess_1', name: 'Alice Smith', identifier: 'alice@example.com' };
const bob = { sessionId: 'sess_2', name: 'Bob Jones', identifier: 'bob@example.com' };
const foundry = { kind: 'membership', organizationId: 'org_1', name: 'Foundry' } as const;

function resolve(mode: UserButtonMode, data: Partial<UserButtonData> = {}) {
  return resolveUserButtonLayout(mode, {
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
  it('spreads them across all three slots in combined mode', () => {
    expect(resolve('combined').actions).toEqual({
      header: ['inviteMembers', 'manageLead'],
      organizationsFooter: ['createOrganization'],
      footer: ['switchAccount', 'signOut'],
    });
  });

  it('carries no account actions at all in organization mode', () => {
    expect(resolve('organization').actions).toEqual({
      header: ['inviteMembers', 'manageLead'],
      organizationsFooter: ['createOrganization'],
      footer: [],
    });
  });

  it('takes the account actions into the header and the foot in user mode', () => {
    expect(resolve('user').actions).toEqual({
      header: ['manageLead'],
      organizationsFooter: [],
      footer: ['switchAccount', 'signOut'],
    });
  });
});

describe('resolveUserButtonLayout, what the data settles', () => {
  it('leads with the account where no organization is active', () => {
    const layout = resolve('combined', { activeOrganization: null });

    expect(layout.lead).toBe('user');
    expect(layout.actions.header).toEqual(['manageLead']);
  });

  it('leads with no selection where no organization is active and personal is hidden', () => {
    const layout = resolve('organization', { activeOrganization: null, hidePersonal: true });

    expect(layout.lead).toBe('none');
    expect(layout.actions.header).toEqual(['manageLead']);
  });

  // With no second account the flyout would open onto one row, so the foot offers that row instead.
  it.each(['combined', 'user'] as const)(
    'collapses the foot to "Add account" in %s mode where there is one account',
    mode => {
      expect(resolve(mode, { additionalSessions: [] }).actions.footer).toEqual(['addAccount', 'signOut']);
    },
  );
});

describe('resolveUserButtonLayout, a combined surface', () => {
  it('leads with the account inside its active organization, inviting to that organization', () => {
    const layout = resolve('combined');

    expect(layout.lead).toBe('member');
    expect(layout.actions.header).toEqual(['inviteMembers', 'manageLead']);
  });

  it('leads with the account alone where no organization is active, even with personal hidden', () => {
    const layout = resolve('combined', { activeOrganization: null, hidePersonal: true });

    expect(layout.lead).toBe('user');
    expect(layout.actions.header).toEqual(['manageLead']);
  });
});

describe('resolveUserButtonLayout, how the header carries its actions', () => {
  it('stacks them wherever a labelled action joins the gear', () => {
    expect(resolve('combined').headerLayout).toBe('stacked');
    expect(resolve('organization').headerLayout).toBe('stacked');
  });

  it('runs the gear inline where it is the only action', () => {
    expect(resolve('user').headerLayout).toBe('inline');
    expect(resolve('organization', { activeOrganization: null, hidePersonal: true }).headerLayout).toBe('inline');
  });
});

describe('resolveUserButtonLayout, which sections render', () => {
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
    expect(resolve('user').showOrganizations).toBe(false);
  });
});
