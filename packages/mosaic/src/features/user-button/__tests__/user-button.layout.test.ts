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
      organizationsHeading: ['manageAccount', 'signOut'],
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
  it('leads with the account where no organization is active', () => {
    const layout = resolve('combined', { activeOrganization: null });

    expect(layout.lead).toBe('user');
    expect(layout.actions.header).toEqual(['signOut', 'manageLead']);
  });

  it('leads with no selection where no organization is active and personal is hidden', () => {
    const layout = resolve('organization', { activeOrganization: null, hidePersonal: true });

    expect(layout.lead).toBe('none');
    expect(layout.actions.header).toEqual(['manageLead']);
  });

  // With no second account the flyout would open onto one row, so the foot offers that row instead.
  // "All accounts" is that one account too, so the foot signs out of just it, in the singular.
  it('collapses the foot to "Add account" and "Sign out" in combined mode where there is one account', () => {
    expect(resolve('combined', { additionalSessions: [] }).actions.footer).toEqual(['addAccount', 'signOut']);
  });

  it('signs a lone account out from the header in user mode, leaving the foot to add one', () => {
    const layout = resolve('user', { additionalSessions: [] });

    expect(layout.actions.header).toEqual(['signOut', 'manageLead']);
    expect(layout.actions.footer).toEqual(['addAccount']);
  });
});

describe('resolveUserButtonLayout, a combined surface led by the account', () => {
  it('leads with the account inside its active organization, inviting to that organization', () => {
    const layout = resolve('combined', {}, 'user');

    expect(layout.lead).toBe('member');
    expect(layout.actions.header).toEqual(['inviteMembers', 'manageLead']);
  });

  it('leads with the account alone where no organization is active', () => {
    const layout = resolve('combined', { activeOrganization: null, hidePersonal: true }, 'user');

    expect(layout.lead).toBe('user');
    expect(layout.actions.header).toEqual(['signOut', 'manageLead']);
  });

  it('is ignored by the single-purpose modes', () => {
    expect(resolve('organization', {}, 'user').lead).toBe('organization');
    expect(resolve('user', {}, 'user').lead).toBe('user');
  });
});

describe('resolveUserButtonLayout, how the header carries its actions', () => {
  it('stacks them wherever a labelled action joins the gear', () => {
    expect(resolve('combined').headerLayout).toBe('stacked');
    expect(resolve('organization').headerLayout).toBe('stacked');
    expect(resolve('user').headerLayout).toBe('stacked');
  });

  it('runs the gear inline where it is the only action', () => {
    expect(resolve('combined', { activeOrganization: null, hidePersonal: true }).headerLayout).toBe('inline');
  });
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
