import type { UserButtonData, UserButtonMode, UserButtonModePriority } from './user-button.types';

/*
 * Which mode puts what where. The surface is three slots deep, in this order, and each mode fills
 * them differently:
 *
 *  combined                       organization                 user
 *  ┌────────────────────────────┐ ┌──────────────────────────┐ ┌────────────────────────────┐
 *  │ Foundry       [Invite][⚙]  │ │ Foundry     [Invite][⚙]  │ │ Alice     [Sign out][⚙]    │ header
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ alice@x.com           [⋯]  │ │                          │ │                            │ organizationsHeading
 *  │ Personal account           │ │ Personal account         │ │                            │ ┐
 *  │ ✓ Foundry                  │ │ ✓ Foundry                │ │                            │ ┘ organization rows
 *  │ + Add organization         │ │ + Add organization       │ │                            │ organizationsFooter
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ ⇄ Switch account        ›  │ │                          │ │ ⇄ Switch account        ›  │ ┐
 *  │ ⤴ Sign out of all accounts │ │                          │ │ ⤴ Sign out of all accounts │ ┘ footer
 *  └────────────────────────────┘ └──────────────────────────┘ └────────────────────────────┘
 *
 * The organizations are listed on the surface, headed by the active account, since they are the
 * workspaces that account can switch between. The other signed-in accounts are not: they are one
 * row at the foot that opens a flyout of them, so the surface stays about the workspace it is on.
 */

/** The four places an action can land. Every mode has a header and a footer; the list's two vary. */
export type UserButtonSlot = 'header' | 'organizationsHeading' | 'organizationsFooter' | 'footer';

export type UserButtonAction =
  | 'addAccount'
  | 'createOrganization'
  | 'inviteMembers'
  /** The gear. Manages whatever the header names: the organization where one leads, else the account. */
  | 'manageLead'
  | 'manageAccount'
  | 'signOut'
  | 'signOutAll'
  /** The flyout of signed-in accounts. Collapses to `addAccount` where there is only the one. */
  | 'switchAccount';

/** One mode's whole surface, top to bottom. */
interface ModeLayout {
  header: readonly UserButtonAction[];
  /**
   * The workspaces the active account switches between: its own, plus the organizations it is in.
   * `false` is a list the mode does not carry at all; `heading: false` runs the rows unheaded.
   * `footer` trails the rows, inside the list, since what it offers is one more workspace.
   */
  organizations: { heading: readonly UserButtonAction[] | false; footer: readonly UserButtonAction[] } | false;
  footer: readonly UserButtonAction[];
}

const modes = {
  combined: {
    header: ['inviteMembers', 'manageLead'],
    organizations: { heading: ['createOrganization', 'manageAccount', 'signOut'], footer: ['createOrganization'] },
    footer: ['switchAccount', 'signOutAll'],
  },
  // Not about the account, so it heads its workspaces with nothing and offers no other account.
  organization: {
    header: ['inviteMembers', 'manageLead'],
    organizations: { heading: false, footer: ['createOrganization'] },
    footer: [],
  },
  // No workspaces at all, so the header takes the account's own actions and the foot is the
  // accounts flyout and what acts across every one of them.
  user: {
    header: ['signOut', 'manageLead'],
    organizations: false,
    footer: ['switchAccount', 'signOutAll'],
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
  /** What each slot carries, in the order it renders. */
  actions: Record<UserButtonSlot, UserButtonAction[]>;
}

export function resolveUserButtonLayout(
  mode: UserButtonMode,
  modePriority: UserButtonModePriority,
  data: UserButtonData,
): UserButtonLayout {
  const declared: ModeLayout = modes[mode];
  const organizationsHeading = declared.organizations === false ? false : declared.organizations.heading;
  const organizationsFooter = declared.organizations === false ? [] : declared.organizations.footer;

  const hasOtherSessions = data.additionalSessions.length > 0;
  // A pending invitation or suggestion counts: it has to be reachable before there is a membership.
  // Loading does not count, so an account with none never opens a list that then disappears.
  const hasOrganizations = data.hasOrganizations || data.suggestions.length > 0 || data.invitations.length > 0;

  /** The action this surface actually carries in place of the one declared, or `null` for none. */
  const resolve = (action: UserButtonAction): UserButtonAction | null => {
    switch (action) {
      // Inviting belongs to whichever organization is active, even where the account is what heads
      // the surface.
      case 'inviteMembers':
        return data.activeOrganization ? action : null;
      // "All accounts" is one account. The account's own row already signs out of it, so the foot
      // would be offering the same thing over again, in the plural.
      case 'signOutAll':
        return hasOtherSessions ? action : null;
      // With no second account there is nothing to switch between, so the flyout collapses to the
      // one row it would have opened onto.
      case 'switchAccount':
        return hasOtherSessions ? action : 'addAccount';
      default:
        return action;
    }
  };

  const slot = (actions: readonly UserButtonAction[]): UserButtonAction[] =>
    actions.map(resolve).filter((action): action is UserButtonAction => action !== null);

  return {
    // Only a combined surface has two things to choose between; the other two are what they are.
    leadWith: mode === 'combined' ? modePriority : mode,
    showOrganizations: declared.organizations !== false && hasOrganizations,
    showOrganizationsHeading: organizationsHeading !== false,
    actions: {
      header: slot(declared.header),
      organizationsHeading: organizationsHeading === false ? [] : slot(organizationsHeading),
      organizationsFooter: slot(organizationsFooter),
      footer: slot(declared.footer),
    },
  };
}
