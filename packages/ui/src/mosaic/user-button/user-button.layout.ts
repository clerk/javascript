import type { UserButtonData, UserButtonMode, UserButtonModePriority } from './user-button.types';

/** Where an affordance lands. `none` is a mode not offering it at all. */
type Slot = 'account-row' | 'accounts-heading' | 'footer' | 'header' | 'none';

/** Which sections a mode opens. Whether the data fills them is settled in `resolveUserButtonLayout`. */
interface Sections {
  /** The workspace list carries the active account's row, and the account-wide actions with it. */
  accountRow: boolean;
  /** There is a workspace list at all, and something to put in it. */
  listsOrganizations: boolean;
  /** There is an Accounts group, and another account to switch to. */
  listsAccounts: boolean;
  /** The Accounts group is headed, so it tells its rows apart and carries "Add account". */
  accountsHeading: boolean;
}

const sections = {
  combined: { accountRow: true, listsOrganizations: true, listsAccounts: true, accountsHeading: true },
  // Not about the account, so it carries no row for one and no accounts to switch between.
  organization: { accountRow: false, listsOrganizations: true, listsAccounts: false, accountsHeading: false },
  // Nothing to tell the account rows apart from, so they stand unheaded.
  user: { accountRow: false, listsOrganizations: false, listsAccounts: true, accountsHeading: false },
} as const satisfies Record<UserButtonMode, Sections>;

/**
 * The slots a mode can name: the two every mode has, plus whichever sections it opens above. A mode
 * cannot put an affordance in a section it does not render, so the table below cannot drift out of
 * step with `sections` without failing to compile.
 */
type ModeSlot<M extends UserButtonMode> =
  | 'footer'
  | 'header'
  | 'none'
  | ((typeof sections)[M]['accountRow'] extends true ? 'account-row' : never)
  | ((typeof sections)[M]['accountsHeading'] extends true ? 'accounts-heading' : never);

/**
 * Where each affordance lands in each mode. One row per affordance, so what the three modes do with
 * any one of them reads on a single line rather than spread across the sections that render it.
 *
 * An affordance falls to the footer wherever the section that would carry it is not there: no
 * account row to hang "Create organization" off, no Accounts heading to hang "Add account" off.
 */
const placements = {
  inviteMembers: { combined: 'header', organization: 'header', user: 'none' },
  signOut: { combined: 'account-row', organization: 'none', user: 'header' },
  createOrganization: { combined: 'account-row', organization: 'footer', user: 'none' },
  addAccount: { combined: 'accounts-heading', organization: 'none', user: 'footer' },
  signOutAll: { combined: 'footer', organization: 'none', user: 'footer' },
} as const satisfies Record<string, { [M in UserButtonMode]: ModeSlot<M> }>;

/**
 * Where each of the surface's affordances lands, resolved once from `mode` and `modePriority` so
 * no section has to read them again. The three modes differ only in the two tables above, so what
 * any one of them renders is legible in one place.
 */
export interface UserButtonLayout extends Sections {
  /** Which workspace the trigger names and the header leads with. */
  leadWith: 'organization' | 'user';
  /** Where each affordance landed, once the mode and the data have both had their say. */
  placement: Record<keyof typeof placements, Slot>;
}

export function resolveUserButtonLayout(
  mode: UserButtonMode,
  modePriority: UserButtonModePriority,
  data: UserButtonData,
): UserButtonLayout {
  const section = sections[mode];
  const listsAccounts = section.listsAccounts && data.additionalSessions.length > 0;
  const accountsHeading = listsAccounts && section.accountsHeading;
  const addAccount = placements.addAccount[mode];

  return {
    // Only a combined surface has two things to choose between; the other two are what they are.
    leadWith: mode === 'combined' ? modePriority : mode,
    accountRow: section.accountRow,
    // A pending invitation or suggestion counts: it has to be reachable before there is a
    // membership. Loading does not count, so an account with none never opens a section that then
    // disappears under it.
    listsOrganizations:
      section.listsOrganizations &&
      (data.hasOrganizations || data.suggestions.length > 0 || data.invitations.length > 0),
    listsAccounts,
    accountsHeading,
    placement: {
      inviteMembers: placements.inviteMembers[mode],
      signOut: placements.signOut[mode],
      createOrganization: placements.createOrganization[mode],
      addAccount: addAccount === 'accounts-heading' && !accountsHeading ? 'footer' : addAccount,
      signOutAll: placements.signOutAll[mode],
    },
  };
}
