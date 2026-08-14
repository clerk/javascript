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
      sessionsHeading: ['addAccount'],
      footer: ['signOutAll'],
    });
  });

  it('carries no account actions at all in organization mode', () => {
    expect(resolve('organization').actions).toEqual({
      header: ['inviteMembers', 'manageLead'],
      organizationsHeading: [],
      sessionsHeading: [],
      footer: ['createOrganization'],
    });
  });

  it('takes the account actions into the header and the foot in user mode', () => {
    expect(resolve('user').actions).toEqual({
      header: ['signOut', 'manageLead'],
      organizationsHeading: [],
      sessionsHeading: [],
      footer: ['addAccount', 'signOutAll'],
    });
  });
});

describe('resolveUserButtonLayout, what the data settles', () => {
  it('offers no invitation where no organization is active', () => {
    expect(resolve('combined', { activeOrganization: null }).actions.header).toEqual(['manageLead']);
  });

  // "All accounts" is one account, and the account's own row already signs out of it.
  it('offers no sign-out of all accounts where there is only the one', () => {
    expect(resolve('user', { additionalSessions: [] }).actions.footer).toEqual(['addAccount']);
  });

  it('drops "Add account" to the foot where no accounts heading renders to carry it', () => {
    const layout = resolve('combined', { additionalSessions: [] });

    expect(layout.showSessionsHeading).toBe(false);
    expect(layout.actions.sessionsHeading).toEqual([]);
    expect(layout.actions.footer).toEqual(['addAccount']);
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

  it('lists the accounts unheaded in user mode, and not at all in organization mode', () => {
    expect(resolve('user')).toMatchObject({ showSessions: true, showSessionsHeading: false });
    expect(resolve('organization')).toMatchObject({ showSessions: false, showSessionsHeading: false });
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
