import type { UserButtonData, UserButtonMode, UserButtonModePriority } from './user-button.types';

/*
 * Which mode puts what where. The surface is four slots deep, in this order, and each mode fills
 * them differently:
 *
 *  combined                       organization                 user
 *  ┌────────────────────────────┐ ┌──────────────────────────┐ ┌────────────────────────────┐
 *  │ Foundry       [Invite][⚙]  │ │ Foundry     [Invite][⚙]  │ │ Alice     [Sign out][⚙]    │ header
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ alice@x.com           [⋯]  │ │                          │ │                            │ organizationsHeading
 *  │ Personal account           │ │ Personal account         │ │                            │ ┐
 *  │ ✓ Foundry                  │ │ ✓ Foundry                │ │                            │ ┘ organization rows
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ Accounts              [⋯]  │ │                          │ │                            │ sessionsHeading
 *  │ ✓ alice@x.com              │ │                          │ │                            │ ┐
 *  │ bob@x.com                  │ │                          │ │ bob@x.com                  │ ┘ session rows
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ ⤴ Sign out of all accounts │ │ + Create organization    │ │ + Add account              │ ┐
 *  │                            │ │                          │ │ ⤴ Sign out of all accounts │ ┘ footer
 *  └────────────────────────────┘ └──────────────────────────┘ └────────────────────────────┘
 *
 * Both lists read the same way: a heading that carries the list's actions behind a `⋯`, then the
 * rows. The organizations are headed by the active account, since they are the workspaces that
 * account can switch between; the sessions are headed by the word "Accounts".
 */

/** The four places an action can land. Every mode has a header and a footer; the headings vary. */
export type UserButtonSlot = 'header' | 'organizationsHeading' | 'sessionsHeading' | 'footer';

export type UserButtonAction =
  | 'addAccount'
  | 'createOrganization'
  | 'inviteMembers'
  /** The gear. Manages whatever the header names: the organization where one leads, else the account. */
  | 'manageLead'
  | 'manageAccount'
  | 'signOut'
  | 'signOutAll';

/** A list the surface can carry. `heading: false` runs the rows unheaded. */
interface ListLayout {
  heading: readonly UserButtonAction[] | false;
}

/** One mode's whole surface, top to bottom. `false` is a list the mode does not carry at all. */
interface ModeLayout {
  header: readonly UserButtonAction[];
  /** The workspaces the active account switches between: its own, plus the organizations it is in. */
  organizations: ListLayout | false;
  /** The other signed-in accounts. */
  sessions: ListLayout | false;
  footer: readonly UserButtonAction[];
}

const modes = {
  combined: {
    header: ['inviteMembers', 'manageLead'],
    organizations: { heading: ['createOrganization', 'manageAccount', 'signOut'] },
    sessions: { heading: ['addAccount'] },
    footer: ['signOutAll'],
  },
  // Not about the account, so it heads its workspaces with nothing and lists no other account.
  organization: {
    header: ['inviteMembers', 'manageLead'],
    organizations: { heading: false },
    sessions: false,
    footer: ['createOrganization'],
  },
  // No workspaces to head the accounts against, so they stand unheaded and the header takes the
  // account's own actions.
  user: {
    header: ['signOut', 'manageLead'],
    organizations: false,
    sessions: { heading: false },
    footer: ['addAccount', 'signOutAll'],
  },
} as const satisfies Record<UserButtonMode, ModeLayout>;

/**
 * Where each of the surface's actions landed, resolved once from `mode`, `modePriority` and the
 * data, so no section has to read any of them again.
 */
export interface UserButtonLayout {
  /** Which workspace the trigger names and the header leads with. */
  leadWith: 'organization' | 'user';
  /** The organization rows: their own workspace, the organizations, and what is on offer. */
  showOrganizations: boolean;
  /**
   * The active account's row above them. Not gated on the rows: an account with no organizations
   * still needs somewhere to manage and sign out of itself.
   */
  showOrganizationsHeading: boolean;
  /** The other signed-in accounts. */
  showSessions: boolean;
  /** The "Accounts" row above them. Pointless with no accounts under it, so it follows the rows. */
  showSessionsHeading: boolean;
  /** What each slot carries, in the order it renders. */
  actions: Record<UserButtonSlot, UserButtonAction[]>;
}

export function resolveUserButtonLayout(
  mode: UserButtonMode,
  modePriority: UserButtonModePriority,
  data: UserButtonData,
): UserButtonLayout {
  const layout: ModeLayout = modes[mode];
  const organizationsHeading = layout.organizations === false ? false : layout.organizations.heading;
  const sessionsHeading = layout.sessions === false ? false : layout.sessions.heading;

  const hasOtherSessions = data.additionalSessions.length > 0;
  // A pending invitation or suggestion counts: it has to be reachable before there is a membership.
  // Loading does not count, so an account with none never opens a list that then disappears.
  const hasOrganizations = data.hasOrganizations || data.suggestions.length > 0 || data.invitations.length > 0;

  const showOrganizations = layout.organizations !== false && hasOrganizations;
  const showOrganizationsHeading = organizationsHeading !== false;
  const showSessions = layout.sessions !== false && hasOtherSessions;
  const showSessionsHeading = showSessions && sessionsHeading !== false;

  const offered = (action: UserButtonAction): boolean => {
    switch (action) {
      // Inviting belongs to whichever organization is active, even where the account is what heads
      // the surface.
      case 'inviteMembers':
        return Boolean(data.activeOrganization);
      // "All accounts" is one account. The account's own row already signs out of it, so the foot
      // would be offering the same thing over again, in the plural.
      case 'signOutAll':
        return hasOtherSessions;
      default:
        return true;
    }
  };

  const actions: Record<UserButtonSlot, UserButtonAction[]> = {
    header: layout.header.filter(offered),
    organizationsHeading: [],
    sessionsHeading: [],
    footer: layout.footer.filter(offered),
  };

  if (organizationsHeading !== false) {
    actions.organizationsHeading.push(...organizationsHeading.filter(offered));
  }
  // The accounts heading follows its rows, so with no other account there is nothing to carry its
  // actions and they fall to the footer, which every mode has.
  if (sessionsHeading !== false) {
    actions[showSessionsHeading ? 'sessionsHeading' : 'footer'].push(...sessionsHeading.filter(offered));
  }

  return {
    // Only a combined surface has two things to choose between; the other two are what they are.
    leadWith: mode === 'combined' ? modePriority : mode,
    showOrganizations,
    showOrganizationsHeading,
    showSessions,
    showSessionsHeading,
    actions,
  };
}
