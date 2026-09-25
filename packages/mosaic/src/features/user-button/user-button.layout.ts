import type { UserButtonData, UserButtonHeaderLayout, UserButtonMode } from './user-button.types';

/*
 * Which mode puts what where. The surface is three slots deep, in this order, and each mode fills
 * them differently:
 *
 *  combined                       organization                 user
 *  ┌────────────────────────────┐ ┌──────────────────────────┐ ┌────────────────────────────┐
 *  │ Foundry                    │ │ Foundry                  │ │ Alice                      │ header
 *  │ [⚙ Settings] [Invite]      │ │ [⚙ Settings] [Invite]    │ │ [⚙ Settings] [Sign out]    │
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ alice@x.com           [⋯]  │ │                          │ │                            │ organizationsHeading
 *  │ Personal account         │ │ Personal account       │ │                            │ ┐
 *  │ ✓ Foundry                  │ │ ✓ Foundry                │ │                            │ ┘ organization rows
 *  │ + Create organization            │ │ + Create organization          │ │                            │ organizationsFooter
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ ⇄ Switch account        ›  │ │                          │ │ ⇄ Switch account        ›  │ ┐
 *  │ ⤴ Sign out of all accounts │ │                          │ │ ⤴ Sign out of all accounts │ ┘ footer
 *  └────────────────────────────┘ └──────────────────────────┘ └────────────────────────────┘
 *
 * The organizations are listed on the surface, headed by the active account, since they are the
 * workspaces that account can switch between. The other signed-in accounts are not: they are one
 * row at the foot that opens a flyout of them, so the surface stays about the workspace it is on.
 *
 * The header is about whatever leads, not the mode: an organization is managed and invited to, an
 * account is managed and signed out of. With no organization active, a combined surface leads with
 * the account.
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
  /** The flyout of signed-in accounts. */
  | 'switchAccount';

/**
 * What the trigger names and the header leads with. `none` is an organization-led surface with no
 * organization active and no personal workspace to fall back to.
 */
export type UserButtonLead = 'organization' | 'user' | 'none';

const headers = {
  organization: ['inviteMembers', 'manageLead'],
  user: ['signOut', 'manageLead'],
  none: ['manageLead'],
} as const satisfies Record<UserButtonLead, readonly UserButtonAction[]>;

/** One mode's whole surface below the header, top to bottom. */
interface ModeLayout {
  /**
   * The workspaces the active account switches between: its own, plus the organizations it is in.
   * `false` is a list the mode does not carry at all; `heading: false` runs the rows unheaded.
   * `footer` trails the rows, inside the list, since what it offers is one more workspace.
   */
  organizations: { heading: readonly UserButtonAction[] | false; footer: readonly UserButtonAction[] } | false;
  /**
   * With a second account the foot opens onto all of them and signs out of every one. With just the
   * one there is nothing to switch between or to sign out of "all" of.
   */
  footer: { multiSession: readonly UserButtonAction[]; singleSession: readonly UserButtonAction[] };
}

const modes = {
  combined: {
    organizations: { heading: ['manageAccount', 'signOut'], footer: ['createOrganization'] },
    footer: { multiSession: ['switchAccount', 'signOutAll'], singleSession: ['addAccount', 'signOut'] },
  },
  // Not about the account, so it heads its workspaces with nothing and offers no other account.
  organization: {
    organizations: { heading: false, footer: ['createOrganization'] },
    footer: { multiSession: [], singleSession: [] },
  },
  // No workspaces at all. The header already signs the lone account out, so the foot only adds one.
  user: {
    organizations: false,
    footer: { multiSession: ['switchAccount', 'signOutAll'], singleSession: ['addAccount'] },
  },
} as const satisfies Record<UserButtonMode, ModeLayout>;

/**
 * Where each of the surface's actions landed, resolved once from `mode` and the data, so no section
 * has to read either of them again.
 */
export interface UserButtonLayout {
  lead: UserButtonLead;
  /** The organization rows: their own workspace, the organizations, and what is on offer. */
  showOrganizations: boolean;
  /**
   * The active account's row above them. Not gated on the rows: an account with no organizations
   * still needs somewhere to manage and sign out of itself.
   */
  showOrganizationsHeading: boolean;
  headerLayout: UserButtonHeaderLayout;
  /** What each slot carries, in the order it renders. */
  actions: Record<UserButtonSlot, UserButtonAction[]>;
}

function resolveLead(mode: UserButtonMode, data: UserButtonData): UserButtonLead {
  if (mode === 'user') {
    return 'user';
  }
  if (data.activeOrganization) {
    return 'organization';
  }
  return data.hidePersonal ? 'none' : 'user';
}

export function resolveUserButtonLayout(mode: UserButtonMode, data: UserButtonData): UserButtonLayout {
  const declared: ModeLayout = modes[mode];
  const organizationsHeading = declared.organizations === false ? false : declared.organizations.heading;
  const organizationsFooter = declared.organizations === false ? [] : declared.organizations.footer;

  const hasOtherSessions = data.additionalSessions.length > 0;
  // A pending invitation or suggestion counts: it has to be reachable before there is a membership.
  // Loading does not count, so an account with none never opens a list that then disappears.
  const hasOrganizations = data.hasOrganizations || data.suggestions.length > 0 || data.invitations.length > 0;

  const lead = resolveLead(mode, data);
  const header = [...headers[lead]];

  return {
    lead,
    showOrganizations: declared.organizations !== false && hasOrganizations,
    showOrganizationsHeading: organizationsHeading !== false,
    headerLayout: header.some(action => action !== 'manageLead') ? 'stacked' : 'inline',
    actions: {
      header,
      organizationsHeading: organizationsHeading === false ? [] : [...organizationsHeading],
      organizationsFooter: [...organizationsFooter],
      footer: [...(hasOtherSessions ? declared.footer.multiSession : declared.footer.singleSession)],
    },
  };
}
