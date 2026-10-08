import {
  switcherBusyKeys,
  type SwitcherInvitation,
  type SwitcherMembership,
  type SwitcherViewProps,
  type SwitcherSession,
  type SwitcherSuggestion,
} from '@clerk/mosaic/features/switcher/switcher.view';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosName, chaosText } from '@/lib/chaos';

// The data behind the design frames: one account, Cameron Walker, signed in three times over, and
// the organizations each frame lists. Only the flagship organizations carry the Clerk mark; the rest wear
// the generated mark Clerk gives an organization that has not uploaded a logo.
const clerkLogo = 'https://avatars.githubusercontent.com/u/49538330?v=4';
const defaultOrgLogo =
  'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18xbHlXRFppb2JyNjAwQUtVZVFEb1NsckVtb00iLCJyaWQiOiJvcmdfMnp6WVh1TURBRTBYWFh5Q1lHN3dyQXRFd0VpIiwiaW5pdGlhbHMiOiJQIn0?width=48';
const cameronPhoto = 'https://randomuser.me/api/portraits/men/32.jpg';

function cameron(sessionId: string): SwitcherSession {
  return { sessionId, name: 'Cameron Walker', identifier: 'cameron@clerk.com', imageUrl: cameronPhoto };
}

const nestLabs: SwitcherMembership = {
  kind: 'membership',
  organizationId: 'org_nestlabs',
  name: 'NestLabs Creative',
  membersCount: 24,
  planLabel: 'Pro plan',
  imageUrl: defaultOrgLogo,
};

const acme: SwitcherMembership = {
  kind: 'membership',
  organizationId: 'org_acme',
  name: 'Acme',
  imageUrl: defaultOrgLogo,
};

const clerkApp: SwitcherMembership = {
  kind: 'membership',
  organizationId: 'org_clerk_app',
  name: 'Clerk App',
  imageUrl: clerkLogo,
};

const clerkSuggestion: SwitcherSuggestion = {
  kind: 'suggestion',
  id: 'sug_clerk',
  organizationId: 'org_clerk',
  name: 'Clerk',
  status: 'pending',
  imageUrl: clerkLogo,
};

/**
 * One signed-in account and everything that belongs to it. The prototype holds all of it the way a
 * backend would; only the active account's half of it ever reaches the component.
 */
interface Account {
  session: SwitcherSession;
  memberships: SwitcherMembership[];
  activeOrganizationId: string | null;
  suggestions: SwitcherSuggestion[];
  invitations: SwitcherInvitation[];
}

type AccountOrganizations = Omit<Account, 'session'>;

/** The multi-account frames: NestLabs Creative active, beside Acme, with Clerk on offer. */
const nestLabsWithSuggestion: AccountOrganizations = {
  activeOrganizationId: nestLabs.organizationId,
  memberships: [nestLabs, acme],
  suggestions: [clerkSuggestion],
  invitations: [],
};

/** The single-account and organization-only frames: NestLabs Creative active, beside Clerk App and Acme. */
export const nestLabsWithClerkApp: AccountOrganizations = {
  activeOrganizationId: nestLabs.organizationId,
  memberships: [nestLabs, clerkApp, acme],
  suggestions: [],
  invitations: [],
};

/** The personal-account frame: no organization active, Clerk App and Acme to switch to. */
export const personalAccount: AccountOrganizations = {
  activeOrganizationId: null,
  memberships: [clerkApp, acme],
  suggestions: [],
  invitations: [],
};

// The other two sign-ins' organizations, reached only by switching to them.
const otherAccounts: Account[] = [
  { session: cameron('sess_cameron_2'), ...nestLabsWithClerkApp },
  { session: cameron('sess_cameron_3'), ...personalAccount },
];

function chaosAccounts(accounts: Account[]): Account[] {
  return accounts.map((account, index) => ({
    ...account,
    session: { ...account.session, name: chaosName(index), identifier: chaosEmail(index) },
    memberships: account.memberships.map(m => ({
      ...m,
      name: chaosText(m.name),
      planLabel: chaosText(m.planLabel),
      membersCount: 1_234_567,
    })),
    suggestions: account.suggestions.map(s => ({ ...s, name: chaosText(s.name) })),
    invitations: account.invitations.map(i => ({ ...i, organizationName: chaosText(i.organizationName) })),
  }));
}

/** Joining is what turns a suggestion or an invitation into an organization you can switch to. */
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
 * The examples are prototypes, not screenshots: every row is wired to state, so picking an organization
 * or an account really switches to it, and Join turns a suggestion into an organization. None of it is
 * instant — each action is a network round trip against Clerk, so the prototype fakes one: the
 * clicked row spins, the rest stand down, and the surface stays open so you land back on the result.
 * Only picking an organization closes it, because that is the one action the surface exists to perform.
 * The actions that would navigate somewhere in a real app (Manage, Invite, Create organization, Add
 * account) have nowhere to go here, so they only close the popover.
 */
export function usePrototype({
  organizations = nestLabsWithSuggestion,
  singleSession = false,
  hidePersonal = false,
}: {
  organizations?: AccountOrganizations;
  singleSession?: boolean;
  hidePersonal?: boolean;
} = {}): Omit<SwitcherViewProps, 'mode'> {
  const [open, setOpen] = useState(false);
  const seed = useChaosFixture(
    [{ session: cameron('sess_cameron_1'), ...organizations }, ...(singleSession ? [] : otherAccounts)],
    chaosAccounts,
  );
  const [accounts, setAccounts] = useState(seed);
  const [activeSessionId, setActiveSessionId] = useState('sess_cameron_1');
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
    hidePersonal,
    // Selecting an organization only ever acts on the active account, and is the one action that
    // closes the surface behind it.
    onSelectOrganization: organizationId =>
      run(
        switcherBusyKeys.selectOrganization(organizationId),
        () => updateActive(a => ({ ...a, activeOrganizationId: organizationId })),
        true,
      ),
    // Joining switches to what you just joined, and staying open is what makes that visible.
    onAcceptSuggestion: id =>
      run(switcherBusyKeys.acceptSuggestion(id), () =>
        updateActive(a => {
          const suggestion = a.suggestions.find(s => s.id === id);
          return suggestion ? join(a, suggestion.organizationId, suggestion.name, suggestion.imageUrl) : a;
        }),
      ),
    onAcceptInvitation: id =>
      run(switcherBusyKeys.acceptInvitation(id), () =>
        updateActive(a => {
          const invitation = a.invitations.find(i => i.id === id);
          return invitation ? join(a, invitation.organizationId, invitation.organizationName, invitation.imageUrl) : a;
        }),
      ),
    onSwitchSession: sessionId => run(switcherBusyKeys.switchSession(sessionId), () => setActiveSessionId(sessionId)),
    onSignOutSession: (sessionId, from) =>
      run(switcherBusyKeys.signOutSession(sessionId, from), () => signOutSession(sessionId)),
    // Nothing is left to render once every account is gone, so this one closes too.
    onSignOutAll: () => run(switcherBusyKeys.signOutAll(), close),
    onManageOrganization: close,
    onInviteMembers: close,
    onManageAccount: close,
    onCreateOrganization: close,
    onAddAccount: close,
  };
}
