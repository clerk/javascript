import type { UserButtonData, UserButtonHeaderLayout, UserButtonMode } from './user-button.types';

/*
 * Which mode puts what where. The surface is three slots deep, in this order, and each mode fills
 * them differently:
 *
 *  combined                       organization                 user
 *  ┌────────────────────────────┐ ┌──────────────────────────┐ ┌────────────────────────────┐
 *  │ Alice ᶠ                    │ │ Foundry                  │ │ Alice                   ⚙  │ header
 *  │ [⚙ Settings ▾] [Invite]    │ │ [⚙ Settings] [Invite]    │ │                            │
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ Personal account           │ │ Personal account         │ │                            │ ┐
 *  │ ✓ Foundry                  │ │ ✓ Foundry                │ │                            │ ┘ organization rows
 *  │ + Create organization      │ │ + Create organization    │ │                            │ organizationsFooter
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ ⇄ Switch account        ›  │ │                          │ │ ⇄ Switch account        ›  │ ┐
 *  │ ⤴ Sign out                 │ │                          │ │ ⤴ Sign out                 │ ┘ footer
 *  └────────────────────────────┘ └──────────────────────────┘ └────────────────────────────┘
 *
 * The organizations are listed on the surface, since they are the workspaces the active account can
 * switch between. The other signed-in accounts are not: they are one row at the foot that opens a
 * flyout of them, so the surface stays about the workspace it is on.
 *
 * The header is about whatever leads, not the mode: an organization is managed and invited to, an
 * account is managed, and signed out of at the foot. A combined surface always leads with the account. With an
 * organization active, the account is badged with it, invites to it, and its Settings opens onto
 * both the organization's settings and the account's.
 */

/** The three places an action can land. Every mode has a header and a footer; the list's varies. */
export type UserButtonSlot = 'header' | 'organizationsFooter' | 'footer';

export type UserButtonAction =
  | 'addAccount'
  | 'createOrganization'
  | 'inviteMembers'
  /** The gear. Manages the header's organization and, where it badges the account, the account too. */
  | 'manageLead'
  | 'signOut'
  /** The flyout of signed-in accounts, adding one, and signing out of all of them. */
  | 'switchAccount';

/**
 * What the trigger names and the header leads with. `member` is the account, badged with the
 * organization it is active in. `none` is an organization-led surface with no organization active
 * and no personal workspace to fall back to.
 */
export type UserButtonLead = 'organization' | 'member' | 'user' | 'none';

const headers = {
  organization: ['inviteMembers', 'manageLead'],
  member: ['inviteMembers', 'manageLead'],
  user: ['manageLead'],
  none: ['manageLead'],
} as const satisfies Record<UserButtonLead, readonly UserButtonAction[]>;

/** One mode's whole surface below the header, top to bottom. */
interface ModeLayout {
  /**
   * The workspaces the active account switches between: its own, plus the organizations it is in.
   * `false` is a list the mode does not carry at all. `footer` trails the rows, inside the list,
   * since what it offers is one more workspace.
   */
  organizations: { footer: readonly UserButtonAction[] } | false;
  /**
   * With a second account the foot switches between them, or signs out of every one. With just the
   * one there is nothing to switch between or to sign out of "all" of.
   */
  footer: { multiSession: readonly UserButtonAction[]; singleSession: readonly UserButtonAction[] };
}

const modes = {
  combined: {
    organizations: { footer: ['createOrganization'] },
    footer: { multiSession: ['switchAccount', 'signOut'], singleSession: ['addAccount', 'signOut'] },
  },
  // Not about the account, so it offers no other account.
  organization: {
    organizations: { footer: ['createOrganization'] },
    footer: { multiSession: [], singleSession: [] },
  },
  // No workspaces at all, so the foot is the whole of it.
  user: {
    organizations: false,
    footer: { multiSession: ['switchAccount', 'signOut'], singleSession: ['addAccount', 'signOut'] },
  },
} as const satisfies Record<UserButtonMode, ModeLayout>;

/**
 * Where each of the surface's actions landed, resolved once from `mode` and the data, so no
 * section has to read either again.
 */
export interface UserButtonLayout {
  lead: UserButtonLead;
  /** The organization rows: their own workspace, the organizations, and what is on offer. */
  showOrganizations: boolean;
  headerLayout: UserButtonHeaderLayout;
  /** What each slot carries, in the order it renders. */
  actions: Record<UserButtonSlot, UserButtonAction[]>;
}

function resolveLead(mode: UserButtonMode, data: UserButtonData): UserButtonLead {
  if (mode === 'user') {
    return 'user';
  }
  if (mode === 'combined') {
    return data.activeOrganization ? 'member' : 'user';
  }
  if (data.activeOrganization) {
    return 'organization';
  }
  return data.hidePersonal ? 'none' : 'user';
}

export function resolveUserButtonLayout(mode: UserButtonMode, data: UserButtonData): UserButtonLayout {
  const declared: ModeLayout = modes[mode];
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
    headerLayout: header.some(action => action !== 'manageLead') ? 'stacked' : 'inline',
    actions: {
      header,
      organizationsFooter: [...organizationsFooter],
      footer: [...(hasOtherSessions ? declared.footer.multiSession : declared.footer.singleSession)],
    },
  };
}
