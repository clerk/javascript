import type { ReactNode } from 'react';

// ─── Data contract ──────────────────────────────────────────────────────────
// Session-backed, discriminated resource rows. 1:1 with `useUserButtonController()`'s output, so the
// controller and the view agree on a shape neither one owns.

export interface UserButtonSession {
  sessionId: string;
  name: string;
  /** Whatever the account is addressed by: username, email, phone, or wallet. */
  identifier: string;
  imageUrl?: string;
}

export interface UserButtonMembership {
  kind: 'membership';
  organizationId: string;
  name: string;
  imageUrl?: string;
  membersCount?: number;
  planLabel?: string;
}

export interface UserButtonSuggestion {
  kind: 'suggestion';
  id: string;
  organizationId: string;
  name: string;
  imageUrl?: string;
  /** `accepted` is awaiting approval, so it lists but cannot be joined again. */
  status: 'pending' | 'accepted';
}

export interface UserButtonInvitation {
  kind: 'invitation';
  id: string;
  organizationId: string;
  organizationName: string;
  imageUrl?: string;
  /** `accepted` is already a workspace, so it lists as one rather than offering to be accepted. */
  status: 'pending' | 'accepted';
}

/** Feeds one more page into a list as its foot scrolls into view. */
export interface UserButtonPaging {
  ref: (element: HTMLElement | null) => void;
  hasMore: boolean;
}

export interface UserButtonData {
  activeSession: UserButtonSession;
  /**
   * The active organization, described whole rather than found in `memberships`, so the surface
   * names it while the list it belongs to is still loading. `null` => the personal workspace.
   */
  activeOrganization: UserButtonMembership | null;
  /**
   * Explicit; do not derive from `memberships.length`. Answered before the lists are fetched, so
   * the surface knows whether to carry a workspace section at all without waiting on them.
   */
  hasOrganizations: boolean;
  /**
   * The account has no workspace of its own to return to, so the organizations are all there is.
   * Withholds the personal row rather than standing it down: this is not a switch that is
   * momentarily unavailable, it is a workspace that does not exist here.
   */
  hidePersonal?: boolean;
  /**
   * A first page is still in flight, so the workspace rows stand in as one placeholder rather than
   * appearing a list at a time.
   */
  organizationsLoading?: boolean;
  memberships: UserButtonMembership[];
  suggestions: UserButtonSuggestion[];
  invitations: UserButtonInvitation[];
  paging?: UserButtonPaging;
  /**
   * The other signed-in accounts. Only sessions: an account's organizations are scoped to the
   * session that fetches them, so they are unknowable until it is the active one.
   */
  additionalSessions: UserButtonSession[];
}

/** All optional. An unhandled action hides (or de-activates) the affordance it drives. */
export interface UserButtonCallbacks {
  /**
   * Acts on the active account; another account's organizations are unreachable until you switch.
   * `null` selects the personal workspace, which is how an account leaves an organization.
   */
  onSelectOrganization?: (organizationId: string | null) => void;
  onAcceptSuggestion?: (suggestionId: string) => void;
  onAcceptInvitation?: (invitationId: string) => void;
  onSwitchSession?: (sessionId: string) => void;
  onSignOutSession?: (sessionId: string) => void;
  onSignOutAll?: () => void;
  onManageOrganization?: () => void;
  onInviteMembers?: () => void;
  onManageAccount?: () => void;
  onCreateOrganization?: () => void;
  onAddAccount?: () => void;
}

/**
 * Which switchers the surface carries. `combined` is both; `organization` is an organization
 * switcher with no account rows; `user` is an account switcher that never shows an organization,
 * even when one is active.
 */
export type UserButtonMode = 'combined' | 'organization' | 'user';

/**
 * Which of the two switchers a `combined` surface leads with: the one named in the trigger and
 * headed in the popup. Both are still listed either way. The single-purpose modes have only one
 * thing to lead with, so they ignore it.
 */
export type UserButtonModePriority = 'organization' | 'user';

/** Which switchers the surface carries, and which one it leads with. */
export interface UserButtonModeProps {
  /**
   * Which switchers the popup carries: both, organizations alone, or accounts alone.
   *
   * @default 'combined'
   */
  mode?: UserButtonMode;
  /**
   * Which switcher a `combined` surface leads with in the trigger and the popup's header. The other
   * one is still listed. Ignored by the single-purpose modes, which have only one thing to lead with.
   *
   * @default 'organization'
   */
  modePriority?: UserButtonModePriority;
}

/** Whether the surface signs itself with Clerk's mark. */
export interface UserButtonBrandingProps {
  /**
   * Signs the foot of the popup with "Secured by Clerk". An instance that has paid the branding off
   * carries none of it, so this follows `displayConfig.branded` rather than being on for everyone.
   *
   * @default true
   */
  branded?: boolean;
}

export interface UserButtonBusyState {
  /**
   * Key of the single in-flight action (see `userButtonBusyKeys`), or `null`/absent when idle. The
   * affordance that owns it spins; every other one is disabled so a second action cannot start.
   */
  pendingKey?: string | null;
  /**
   * Names the in-flight action for assistive tech ("Switching to Foundry"), announced by the popup's
   * live region for as long as it runs. Nothing else reports the wait: the row that started it keeps
   * focus while it stands down, and its spinner is decorative. Absent, the wait passes in silence.
   */
  pendingLabel?: string;
}

// ─── Menu items ─────────────────────────────────────────────────────────────

/**
 * A built-in action the foot of the popup lists as a row of its own, named by the id `menuItemOrder`
 * knows it by. The surface's other actions live in its header or behind a `⋯`, where there is no
 * list for an order to run in.
 */
export type UserButtonMenuItemId = 'createOrganization' | 'addAccount' | 'signOutAll';

interface UserButtonMenuItemBase {
  /** Identifies the row, for ordering. */
  id: string;
  /** Names the row. */
  label: string;
  icon?: ReactNode;
}

/** An action of your own at the foot of the popup. */
export interface UserButtonMenuAction extends UserButtonMenuItemBase {
  onClick: () => void;
  href?: never;
}

/** A row at the foot of the popup that leaves for somewhere else. */
export interface UserButtonMenuLink extends UserButtonMenuItemBase {
  /** Where the row goes. */
  href: string;
  onClick?: never;
}

export type UserButtonMenuItem = UserButtonMenuAction | UserButtonMenuLink;

/** The app's own actions at the foot of the popup, and the order the foot's rows run in. */
export interface UserButtonMenuProps {
  /** Actions and links of your own, added to the foot of the popup ahead of Clerk's own rows. */
  customMenuItems?: UserButtonMenuItem[];
  /**
   * The order the foot's rows run in, by id: a built-in row's id, or a custom item's `id`. Anything
   * left out follows the rows named here. An id the surface does not carry as a row is ignored,
   * since which rows the foot has depends on its mode.
   */
  menuItemOrder?: (UserButtonMenuItemId | (string & {}))[];
}
