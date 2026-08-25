import { Icon } from '@clerk/ui/mosaic/components/icon';
import {
  userButtonBusyKeys,
  type UserButtonInvitation,
  type UserButtonMembership,
  type UserButtonProps,
  type UserButtonSession,
  type UserButtonSuggestion,
  UserButtonView,
} from '@clerk/ui/mosaic/user-button/user-button.view';
import { useEffect, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './user-button.stories?raw';

export const meta: StoryMeta = {
  group: 'User Button',
  title: 'UserButton',
  label: 'User button',
  source: 'packages/ui/src/mosaic/user-button/user-button.view.tsx',
};

// Accounts wear their own photo. Only the flagship workspace carries the Clerk mark; the rest wear
// the generated mark Clerk gives an organization that has not uploaded a logo.
const clerkLogo = 'https://avatars.githubusercontent.com/u/49538330?v=4';
const defaultOrgLogo =
  'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18xbHlXRFppb2JyNjAwQUtVZVFEb1NsckVtb00iLCJyaWQiOiJvcmdfMnp6WVh1TURBRTBYWFh5Q1lHN3dyQXRFd0VpIiwiaW5pdGlhbHMiOiJQIn0?width=48';

const colin: UserButtonSession = {
  sessionId: 'sess_colin',
  name: 'Colin',
  identifier: 'colin@clerk.dev',
  imageUrl: 'https://avatars.githubusercontent.com/u/51144033?v=4',
};

const braden: UserButtonSession = {
  sessionId: 'sess_braden',
  name: 'Braden',
  identifier: 'braden@clerk.dev',
  imageUrl: 'https://avatars.githubusercontent.com/u/64913815?v=4',
};

/**
 * One signed-in account and everything that belongs to it. The prototype holds all of it the way a
 * backend would; only the active account's half of it ever reaches the component.
 */
interface Account {
  session: UserButtonSession;
  memberships: UserButtonMembership[];
  activeOrganizationId: string | null;
  suggestions: UserButtonSuggestion[];
  invitations: UserButtonInvitation[];
}

const clerkCloud: UserButtonMembership = {
  kind: 'membership',
  organizationId: 'org_clerk_cloud',
  name: 'Clerk Cloud',
  membersCount: 6,
  imageUrl: defaultOrgLogo,
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
      {
        kind: 'suggestion',
        id: 'sug_labs',
        organizationId: 'org_clerk_labs',
        name: 'Clerk Labs',
        status: 'pending',
        imageUrl: defaultOrgLogo,
      },
    ],
    invitations: [],
  },
  {
    session: braden,
    // An organization only Braden is in, so switching to him changes the header, the trigger, and
    // the list under it all at once.
    activeOrganizationId: 'org_clerk_marketing',
    memberships: [
      {
        kind: 'membership',
        organizationId: 'org_clerk_marketing',
        name: 'Clerk Marketing',
        membersCount: 9,
        imageUrl: defaultOrgLogo,
      },
      clerkCloud,
    ],
    suggestions: [],
    invitations: [
      {
        kind: 'invitation',
        id: 'inv_app',
        organizationId: 'org_clerk_app',
        organizationName: 'Clerk app',
        status: 'pending',
        imageUrl: clerkLogo,
      },
    ],
  },
];

/** Joining is what turns a suggestion or an invitation into a workspace you can switch to. */
function join(account: Account, organizationId: string, name: string, imageUrl?: string): Account {
  return {
    ...account,
    activeOrganizationId: organizationId,
    memberships: [...account.memberships, { kind: 'membership', organizationId, name, imageUrl }],
    suggestions: account.suggestions.filter(s => s.organizationId !== organizationId),
    invitations: account.invitations.filter(i => i.organizationId !== organizationId),
  };
}

// Long enough to read the spinner without making the prototype feel broken.
const LATENCY_MS = 800;

/**
 * The examples are prototypes, not screenshots: every row is wired to state, so picking a workspace
 * or an account really switches to it, and Join turns a suggestion into a workspace. None of it is
 * instant — each action is a network round trip against Clerk, so the prototype fakes one: the
 * clicked row spins, the rest stand down, and the surface stays open so you land back on the result.
 * Only picking a workspace closes it, because that is the one action the surface exists to perform.
 * The actions that would navigate somewhere in a real app (Manage, Invite, Add organization, Add
 * account) have nowhere to go here, so they only close the popover.
 */
function usePrototype(): Omit<UserButtonProps, 'mode'> {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [activeSessionId, setActiveSessionId] = useState(colin.sessionId);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const account = accounts.find(a => a.session.sessionId === activeSessionId) ?? accounts[0];
  const close = () => setOpen(false);

  // One action at a time, the same re-entry guard the connected component holds while a request
  // is in flight. `pendingKey` is what the view reads to spin one row and stand the others down.
  const run = (key: string, commit: () => void, closeOnSuccess = false) => {
    if (pendingKey) {
      return;
    }
    setPendingKey(key);
    setTimeout(() => {
      commit();
      setPendingKey(null);
      if (closeOnSuccess) {
        close();
      }
    }, LATENCY_MS);
  };

  const updateActive = (change: (account: Account) => Account) =>
    setAccounts(current => current.map(a => (a.session.sessionId === activeSessionId ? change(a) : a)));

  const signOutSession = (sessionId: string) => {
    const remaining = accounts.filter(a => a.session.sessionId !== sessionId);
    const [next] = remaining;
    // A prototype with nobody signed in has nothing left to show, so the last account stays put.
    if (!next) {
      return;
    }
    setAccounts(remaining);
    if (sessionId === activeSessionId) {
      setActiveSessionId(next.session.sessionId);
    }
  };

  return {
    open,
    onOpenChange: setOpen,
    pendingKey,
    activeSession: account.session,
    // The join is the backend's, not the component's: it is handed the active organization whole.
    activeOrganization: account.memberships.find(m => m.organizationId === account.activeOrganizationId) ?? null,
    hasOrganizations: account.memberships.length > 0,
    memberships: account.memberships,
    suggestions: account.suggestions,
    invitations: account.invitations,
    additionalSessions: accounts.filter(a => a.session.sessionId !== activeSessionId).map(a => a.session),
    // Selecting an organization only ever acts on the active account, and is the one action that
    // closes the surface behind it.
    onSelectOrganization: organizationId =>
      run(
        userButtonBusyKeys.selectOrganization(organizationId),
        () => updateActive(a => ({ ...a, activeOrganizationId: organizationId })),
        true,
      ),
    // Joining switches to what you just joined, and staying open is what makes that visible.
    onAcceptSuggestion: id =>
      run(userButtonBusyKeys.acceptSuggestion(id), () =>
        updateActive(a => {
          const suggestion = a.suggestions.find(s => s.id === id);
          return suggestion ? join(a, suggestion.organizationId, suggestion.name, suggestion.imageUrl) : a;
        }),
      ),
    onAcceptInvitation: id =>
      run(userButtonBusyKeys.acceptInvitation(id), () =>
        updateActive(a => {
          const invitation = a.invitations.find(i => i.id === id);
          return invitation ? join(a, invitation.organizationId, invitation.organizationName, invitation.imageUrl) : a;
        }),
      ),
    onSwitchSession: sessionId => run(userButtonBusyKeys.switchSession(sessionId), () => setActiveSessionId(sessionId)),
    onSignOutSession: sessionId => run(userButtonBusyKeys.signOutSession(sessionId), () => signOutSession(sessionId)),
    // Nothing is left to render once every account is gone, so this one closes too.
    onSignOutAll: () => run(userButtonBusyKeys.signOutAll(), close),
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
    <UserButtonView
      {...prototype}
      mode='combined'
    />
  );
}

export function UserPriority(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  return (
    <UserButtonView
      {...prototype}
      mode='combined'
      modePriority='user'
    />
  );
}

export function AvatarOnly(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  return (
    <UserButtonView
      {...prototype}
      renderTriggerLabel={false}
    />
  );
}

export function WithoutTriggerBadge(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  return (
    <UserButtonView
      {...prototype}
      renderTriggerBadge={false}
    />
  );
}

export function Organizations(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  // Fed the same data as the others, including the additional account it deliberately never shows.
  return (
    <UserButtonView
      {...prototype}
      mode='organization'
    />
  );
}

export function User(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  // Fed the same data too: an active organization and its workspaces, none of which this mode shows.
  return (
    <UserButtonView
      {...prototype}
      mode='user'
    />
  );
}

export function SingleSession(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  // What an instance in single-session mode hands the view: one account, and neither of the two
  // actions that only make sense with a second one. The account's own `⋯` still signs out of it.
  return (
    <UserButtonView
      {...prototype}
      mode='combined'
      additionalSessions={[]}
      onAddAccount={undefined}
      onSignOutAll={undefined}
    />
  );
}

export function CustomMenuItems(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  // The app's own rows join the foot, and `menuItemOrder` puts them wherever it names them. Ids for
  // rows the surface does not carry are ignored, so one order can cover every mode.
  return (
    <UserButtonView
      {...prototype}
      mode='combined'
      // One account resolves the accounts row to "Add account", which is the form `menuItemOrder`
      // names by either id.
      additionalSessions={[]}
      customMenuItems={[
        {
          id: 'settings',
          label: 'App settings',
          icon: (
            <Icon
              name='cog'
              size='sm'
            />
          ),
          onClick: () => {},
        },
        // `icon` takes any node, so an app brings its own glyph rather than picking from Mosaic's set.
        {
          id: 'docs',
          label: 'Documentation',
          icon: (
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M2.5 3.5h4a2 2 0 0 1 2 2v7a1.5 1.5 0 0 0-1.5-1.5h-4.5Z' />
              <path d='M14.5 3.5h-4a2 2 0 0 0-2 2v7a1.5 1.5 0 0 1 1.5-1.5h4.5Z' />
            </svg>
          ),
          href: 'https://clerk.com/docs',
        },
      ]}
      menuItemOrder={['docs', 'addAccount', 'signOutAll', 'settings']}
    />
  );
}

// Longer than the action latency above: this one is there to be caught, not to be got past.
const ORGANIZATIONS_LATENCY_MS = 2500;

/**
 * The workspace list's first page landing under a popup that is already open. The other examples
 * are handed their organizations on the first render, so the placeholder they would show has
 * nothing to show it. The wait restarts on every open, so it can be watched more than once.
 */
export function LoadingOrganizations(_args: Record<string, unknown>) {
  const prototype = usePrototype();
  const [organizationsLoading, setOrganizationsLoading] = useState(false);

  useEffect(() => {
    if (!prototype.open) {
      return;
    }
    setOrganizationsLoading(true);
    const timer = setTimeout(() => setOrganizationsLoading(false), ORGANIZATIONS_LATENCY_MS);
    return () => clearTimeout(timer);
  }, [prototype.open]);

  return (
    <UserButtonView
      {...prototype}
      mode='combined'
      organizationsLoading={organizationsLoading}
    />
  );
}
