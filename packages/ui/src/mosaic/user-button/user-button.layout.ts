import type { UserButtonData, UserButtonMode, UserButtonModePriority } from './user-button.types';

/**
 * Where each of the surface's affordances lands, resolved once from `mode` and `modePriority` so
 * no section has to read them again. The three modes differ only in this table, so what any one of
 * them renders is legible in one place rather than spread across the sections that render it.
 */
export interface UserButtonLayout {
  /** Which workspace the trigger names and the header leads with. */
  leadWith: 'organization' | 'user';
  /** The workspace list carries the active account's row, and the account-wide actions with it. */
  accountRow: boolean;
  /** "Sign out" takes a header slot, rather than hanging off an account row that isn't there. */
  signOutInHeader: boolean;
  /** There is a workspace list at all, and something to put in it. */
  listsOrganizations: boolean;
  /** There is an Accounts group, and another account to switch to. */
  listsAccounts: boolean;
  /** The Accounts group is headed, so it tells its rows apart and carries "Add account". */
  accountsHeading: boolean;
  createOrganizationInFooter: boolean;
  addAccountInFooter: boolean;
  signOutAllInFooter: boolean;
}

/**
 * The mode's half of the answer. The three list flags are what the mode allows; whether the data
 * fills them is settled in `resolveUserButtonLayout`.
 */
type ModeSlots = Omit<UserButtonLayout, 'leadWith'>;

const modeSlots = {
  combined: {
    accountRow: true,
    signOutInHeader: false,
    listsOrganizations: true,
    listsAccounts: true,
    accountsHeading: true,
    createOrganizationInFooter: false,
    addAccountInFooter: true,
    signOutAllInFooter: true,
  },
  // No account rows, so nothing carries the account-wide actions: "Create organization" takes the
  // footer slot they occupy elsewhere, and signing out is not this surface's to offer.
  organization: {
    accountRow: false,
    signOutInHeader: false,
    listsOrganizations: true,
    listsAccounts: false,
    accountsHeading: false,
    createOrganizationInFooter: true,
    addAccountInFooter: false,
    signOutAllInFooter: false,
  },
  // Nothing to tell the account rows apart from, so they stand unheaded and the actions the
  // heading would carry fall to the header and the footer.
  user: {
    accountRow: false,
    signOutInHeader: true,
    listsOrganizations: false,
    listsAccounts: true,
    accountsHeading: false,
    createOrganizationInFooter: false,
    addAccountInFooter: true,
    signOutAllInFooter: true,
  },
} as const satisfies Record<UserButtonMode, ModeSlots>;

export function resolveUserButtonLayout(
  mode: UserButtonMode,
  modePriority: UserButtonModePriority,
  data: UserButtonData,
): UserButtonLayout {
  const slots = modeSlots[mode];
  const listsAccounts = slots.listsAccounts && data.additionalSessions.length > 0;
  const accountsHeading = listsAccounts && slots.accountsHeading;

  return {
    // Only a combined surface has two things to choose between; the other two are what they are.
    leadWith: mode === 'combined' ? modePriority : mode,
    accountRow: slots.accountRow,
    signOutInHeader: slots.signOutInHeader,
    // A pending invitation or suggestion counts: it has to be reachable before there is a
    // membership. Loading does not count, so an account with none never opens a section that then
    // disappears under it.
    listsOrganizations:
      slots.listsOrganizations && (data.hasOrganizations || data.suggestions.length > 0 || data.invitations.length > 0),
    listsAccounts,
    accountsHeading,
    createOrganizationInFooter: slots.createOrganizationInFooter,
    // "Add account" lives in the Accounts heading wherever there is one; the footer is where it
    // goes when there is not.
    addAccountInFooter: slots.addAccountInFooter && !accountsHeading,
    signOutAllInFooter: slots.signOutAllInFooter,
  };
}
