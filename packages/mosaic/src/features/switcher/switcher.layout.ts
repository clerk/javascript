import type { SwitcherData, SwitcherMode } from './switcher.types';

/*
 * Which mode puts what where. Under the header the surface is three slots deep, in this order, and
 * each mode fills them differently:
 *
 *  combined                       organization                 user
 *  ┌────────────────────────────┐ ┌──────────────────────────┐ ┌────────────────────────────┐
 *  │ Foundry ᵃ                  │ │ Foundry                  │ │ Alice                      │ header
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ Personal account           │ │ Personal account         │ │                            │ ┐
 *  │ ✓ Foundry                  │ │ ✓ Foundry                │ │                            │ ┘ organization rows
 *  │ + Add organization         │ │ + Add organization       │ │                            │ organizationsFooter
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ ⚙ Settings              ›  │ │ ⚙ Settings               │ │ ⚙ Settings                 │ ┐
 *  │ ⊕ Invite members           │ │ ⊕ Invite members         │ │                            │ ┘ manage
 *  ├────────────────────────────┤ ├──────────────────────────┤ ├────────────────────────────┤
 *  │ ⇄ Switch account        ›  │ │                          │ │ ⇄ Switch account        ›  │ ┐
 *  │ ⤴ Sign out                 │ │                          │ │ ⤴ Sign out                 │ ┘ footer
 *  └────────────────────────────┘ └──────────────────────────┘ └────────────────────────────┘
 *
 * The organizations are listed on the surface, since they are what the active account can
 * switch between. The other signed-in accounts are not: they are one row at the foot that opens a
 * flyout of them, so the surface stays about the organization it is on.
 *
 * The header only names whatever leads; what can be done about it is the manage group, which the
 * app's own rows join. An
 * organization is managed and invited to, an account is managed, and signed out of at the foot. A
 * combined surface leads with the account until an organization is active. Then it leads with the
 * organization, badged with the account, invites to it, and its Settings opens onto both the
 * organization's settings and the account's.
 */

/** The three places an action can land. Which of them a mode fills varies. */
export type SwitcherSlot = 'organizationsFooter' | 'manage' | 'footer';

export type SwitcherAction =
  | 'addAccount'
  | 'createOrganization'
  | 'inviteMembers'
  /** Settings. Manages the lead's organization and, where it badges the account, the account too. */
  | 'settings'
  | 'signOut'
  /** The flyout of signed-in accounts, adding one, and signing out of all of them. */
  | 'switchAccount';

/**
 * What the trigger names and the header leads with. `personal` and `none` are an organization-led
 * surface with no organization active, falling back to the personal account or to nothing. Neither
 * has an organization to manage, and an organization-led surface never manages the account.
 */
export type SwitcherLead = 'organization' | 'user' | 'personal' | 'none';

const manage = {
  organization: ['settings', 'inviteMembers'],
  user: ['settings'],
  personal: [],
  none: [],
} as const satisfies Record<SwitcherLead, readonly SwitcherAction[]>;

/** One mode's whole surface below the header, top to bottom. */
interface ModeLayout {
  /**
   * The organizations the active account switches between: its personal account, plus the organizations it is in.
   * `false` is a list the mode does not carry at all. `footer` trails the rows, inside the list,
   * since what it offers is one more organization.
   */
  organizations: { footer: readonly SwitcherAction[] } | false;
  /**
   * With a second account the foot switches between them, or signs out of every one. With just the
   * one there is nothing to switch between or to sign out of "all" of.
   */
  footer: { multiSession: readonly SwitcherAction[]; singleSession: readonly SwitcherAction[] };
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
  // No organizations at all, so the foot is the whole of it.
  user: {
    organizations: false,
    footer: { multiSession: ['switchAccount', 'signOut'], singleSession: ['addAccount', 'signOut'] },
  },
} as const satisfies Record<SwitcherMode, ModeLayout>;

/**
 * Where each of the surface's actions landed, resolved once from `mode` and the data, so no
 * section has to read either again.
 */
export interface SwitcherLayout {
  lead: SwitcherLead;
  /** The organization lead is badged with the user, and its gear manages both. */
  userBadge: boolean;
  /** The organization rows: the personal account, the organizations, and what is on offer. */
  showOrganizations: boolean;
  /** What each slot carries, in the order it renders. */
  actions: Record<SwitcherSlot, SwitcherAction[]>;
}

function resolveLead(mode: SwitcherMode, data: SwitcherData): SwitcherLead {
  if (mode === 'user') {
    return 'user';
  }
  if (mode === 'combined') {
    return data.activeOrganization ? 'organization' : 'user';
  }
  if (data.activeOrganization) {
    return 'organization';
  }
  return data.hidePersonal ? 'none' : 'personal';
}

export function resolveSwitcherLayout(mode: SwitcherMode, data: SwitcherData): SwitcherLayout {
  const declared: ModeLayout = modes[mode];
  const organizationsFooter = declared.organizations === false ? [] : declared.organizations.footer;

  const hasOtherSessions = data.additionalSessions.length > 0;
  // A pending invitation or suggestion counts: it has to be reachable before there is a membership.
  // Loading does not count, so an account with none never opens a list that then disappears.
  const hasOrganizations = data.hasOrganizations || data.suggestions.length > 0 || data.invitations.length > 0;

  const lead = resolveLead(mode, data);

  return {
    lead,
    userBadge: mode === 'combined' && lead === 'organization',
    showOrganizations: declared.organizations !== false && hasOrganizations,
    actions: {
      organizationsFooter: [...organizationsFooter],
      manage: [...manage[lead]],
      footer: [...(hasOtherSessions ? declared.footer.multiSession : declared.footer.singleSession)],
    },
  };
}
