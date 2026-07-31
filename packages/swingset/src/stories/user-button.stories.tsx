/** @jsxImportSource @emotion/react */
import {
  UserButton,
  type UserButtonInvitation,
  type UserButtonMembership,
  type UserButtonProps,
  type UserButtonSession,
  type UserButtonSuggestion,
} from '@clerk/ui/mosaic/user-button/user-button.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './user-button.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserButton',
  source: 'packages/ui/src/mosaic/user-button/user-button.view.tsx',
};

// Accounts wear their own photo. Only the flagship workspace carries the Clerk mark — the rest
// fall back to their initials, so a switch is visible on the trigger rather than just in the list.
const clerkLogo = 'https://avatars.githubusercontent.com/u/49538330?v=4';

const colin: UserButtonSession = {
  sessionId: 'sess_colin',
  userId: 'user_colin',
  name: 'Colin',
  email: 'colin@clerk.dev',
  imageUrl: 'https://avatars.githubusercontent.com/u/51144033?v=4',
};

const braden: UserButtonSession = {
  sessionId: 'sess_braden',
  userId: 'user_braden',
  name: 'Braden',
  email: 'braden@clerk.dev',
  imageUrl: 'https://avatars.githubusercontent.com/u/64913815?v=4',
};

/** One signed-in account and everything that belongs to it. */
interface Account {
  session: UserButtonSession;
  activeOrganizationId: string | null;
  memberships: UserButtonMembership[];
  suggestions: UserButtonSuggestion[];
  invitations: UserButtonInvitation[];
}

const clerkCloud: UserButtonMembership = {
  kind: 'membership',
  organizationId: 'org_clerk_cloud',
  name: 'Clerk Cloud',
  membersCount: 6,
};

// Two accounts with different workspaces, so switching account changes the list under it too.
const initialAccounts: Account[] = [
  {
    session: colin,
    activeOrganizationId: 'org_clerk_app',
    memberships: [
      {
        kind: 'membership',
        organizationId: 'org_clerk_app',
        name: 'Clerk app',
        membersCount: 24,
        planLabel: 'Pro plan',
        imageUrl: clerkLogo,
      },
      clerkCloud,
    ],
    suggestions: [
      { kind: 'suggestion', id: 'sug_labs', organizationId: 'org_clerk_labs', name: 'Clerk Labs', status: 'pending' },
    ],
    invitations: [],
  },
  {
    session: braden,
    activeOrganizationId: 'org_clerk_cloud',
    memberships: [clerkCloud],
    suggestions: [],
    invitations: [
      {
        kind: 'invitation',
        id: 'inv_app',
        organizationId: 'org_clerk_app',
        organizationName: 'Clerk app',
        imageUrl: clerkLogo,
      },
    ],
  },
];

/** Joining is what turns a suggestion or an invitation into a workspace you can switch to. */
function join(account: Account, organizationId: string, name: string, imageUrl?: string): Account {
  return {
    ...account,
    // Switching to what you just joined is what makes the Join button's effect visible.
    activeOrganizationId: organizationId,
    memberships: [...account.memberships, { kind: 'membership', organizationId, name, imageUrl }],
    suggestions: account.suggestions.filter(s => s.organizationId !== organizationId),
    invitations: account.invitations.filter(i => i.organizationId !== organizationId),
  };
}

/**
 * The examples are prototypes, not screenshots: every row is wired to state, so picking a workspace
 * or an account really switches to it and closes the surface, and Join turns a suggestion into a
 * workspace. The actions that would navigate somewhere in a real app (Manage, Invite, Create
 * organization, Add account) have nowhere to go here, so they only close the popover.
 */
function usePrototype(): Omit<UserButtonProps, 'mode'> {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [activeSessionId, setActiveSessionId] = useState(colin.sessionId);

  const account = accounts.find(a => a.session.sessionId === activeSessionId) ?? accounts[0];
  const close = () => setOpen(false);

  // Every switch closes the surface, the way it would once the app re-rendered around it.
  const update = (change: (account: Account) => Account) => {
    setAccounts(accounts.map(a => (a.session.sessionId === activeSessionId ? change(a) : a)));
    close();
  };

  const signOutSession = (sessionId: string) => {
    const [next] = accounts.filter(a => a.session.sessionId !== sessionId);
    // A prototype with nobody signed in has nothing left to show, so the last account stays put.
    if (next) {
      setAccounts(accounts.filter(a => a.session.sessionId !== sessionId));
      if (sessionId === activeSessionId) {
        setActiveSessionId(next.session.sessionId);
      }
    }
    close();
  };

  return {
    open,
    onOpenChange: setOpen,
    status: 'ready',
    activeSession: account.session,
    activeOrganizationId: account.activeOrganizationId,
    hasOrganizations: account.memberships.length > 0,
    memberships: account.memberships,
    suggestions: account.suggestions,
    invitations: account.invitations,
    additionalSessions: accounts.filter(a => a.session.sessionId !== activeSessionId).map(a => a.session),
    onSelectOrganization: organizationId => update(a => ({ ...a, activeOrganizationId: organizationId })),
    onSelectPersonal: () => update(a => ({ ...a, activeOrganizationId: null })),
    onAcceptSuggestion: id =>
      update(a => {
        const suggestion = a.suggestions.find(s => s.id === id);
        return suggestion ? join(a, suggestion.organizationId, suggestion.name, suggestion.imageUrl) : a;
      }),
    onAcceptInvitation: id =>
      update(a => {
        const invitation = a.invitations.find(i => i.id === id);
        return invitation ? join(a, invitation.organizationId, invitation.organizationName, invitation.imageUrl) : a;
      }),
    onSwitchSession: sessionId => {
      setActiveSessionId(sessionId);
      close();
    },
    onSignOutSession: signOutSession,
    onSignOutAll: close,
    onManageOrganization: close,
    onInviteMembers: close,
    onManageAccount: close,
    onCreateOrganization: close,
    onAddAccount: close,
  };
}

export function Combined(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  return (
    <UserButton
      {...prototype}
      mode='combined'
    />
  );
}

export function Organizations(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  // Fed the same data as the others, including the additional account it deliberately never shows.
  return (
    <UserButton
      {...prototype}
      mode='orgs'
    />
  );
}

export function User(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  // Fed the same data too: an active organization and its workspaces, none of which this mode shows.
  return (
    <UserButton
      {...prototype}
      mode='user'
    />
  );
}
