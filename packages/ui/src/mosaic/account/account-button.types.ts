// ─── Data contract ──────────────────────────────────────────────────────────
// Session-backed, discriminated resource rows. 1:1 with `useAccountButtonController()` output so the
// controller is a drop-in for the presentational view.

export interface AccountButtonAccount {
  sessionId: string;
  userId: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export interface AccountButtonMembership {
  kind: 'membership';
  organizationId: string;
  name: string;
  imageUrl?: string;
  membersCount?: number;
  planLabel?: string;
  upgradeable?: boolean;
  membershipRequestCount?: number;
}

export interface AccountButtonSuggestion {
  kind: 'suggestion';
  id: string;
  organizationId: string;
  name: string;
  imageUrl?: string;
  status: 'pending' | 'accepted';
}

export interface AccountButtonInvitation {
  kind: 'invitation';
  id: string;
  organizationId: string;
  organizationName: string;
  imageUrl?: string;
}

export interface AccountButtonData {
  status: 'loading' | 'ready';
  activeAccount: AccountButtonAccount;
  /** `null` => the personal workspace is active. */
  activeOrganizationId: string | null;
  /** Explicit; do not derive from `memberships.length`. */
  hasOrganizations: boolean;
  memberships: AccountButtonMembership[];
  suggestions: AccountButtonSuggestion[];
  invitations: AccountButtonInvitation[];
  additionalAccounts: AccountButtonAccount[];
}

/** All optional. An unhandled action hides (or de-activates) the affordance it drives. */
export interface AccountButtonCallbacks {
  onSelectOrganization?: (organizationId: string) => void;
  onSelectPersonal?: () => void;
  onAcceptSuggestion?: (suggestionId: string) => void;
  onAcceptInvitation?: (invitationId: string) => void;
  onSwitchAccount?: (sessionId: string) => void;
  onSignOutSession?: (sessionId: string) => void;
  onSignOutAll?: () => void;
  onManageOrganization?: () => void;
  onManageMembers?: () => void;
  onManageAccount?: () => void;
  onCreateOrganization?: () => void;
  onAddAccount?: () => void;
  onUpgrade?: () => void;
}

/**
 * Busy state for the popover. `pendingKey` is the target key of the single in-flight action (see
 * `accountBusyKeys`), or `null` when idle. The affordance whose key matches shows a spinner; every
 * other affordance is disabled to block double-submits.
 */
export interface AccountButtonBusyState {
  pendingKey?: string | null;
}

/** Stable keys identifying which affordance owns the in-flight action. Shared by container and view. */
export const accountBusyKeys = {
  selectOrganization: (organizationId: string) => `select-org:${organizationId}`,
  selectPersonal: () => 'select-personal',
  switchAccount: (sessionId: string) => `switch:${sessionId}`,
  signOutSession: (sessionId: string) => `sign-out:${sessionId}`,
  signOutAll: () => 'sign-out-all',
  acceptSuggestion: (suggestionId: string) => `accept-suggestion:${suggestionId}`,
  acceptInvitation: (invitationId: string) => `accept-invitation:${invitationId}`,
} as const;
