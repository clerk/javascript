export type UserProfileEditPasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

export interface UserProfileEditPasswordValue {
  /** Only carried when the flow asked for it. */
  currentPassword?: string;
  newPassword: string;
  signOutOfOtherSessions: boolean;
}

/** The enterprise connection that owns the password, shown in place of the edit action. */
export interface UserProfilePasswordManagedBy {
  /** The connection's display name, e.g. `'Okta'`. Rendered as "Managed by {name}". */
  name: string;
  /** The connection's logo. A generic lock stands in when absent (a custom IDP with no icon). */
  iconUrl?: string;
}

export interface UserProfilePasswordSectionViewProps {
  sectionTitle?: string;
  /** Whether the user has a password. Decides between replacing one and setting the first. */
  hasPassword?: boolean;
  /** Whether the save must carry the password being replaced. Off when reverification stands in for it. */
  requiresCurrentPassword?: boolean;
  /**
   * Supplied from `user.enterpriseAccounts`. When set, the connection owns the password: the row
   * shows "Managed by {name}" in place of the edit action and never opens the dialog.
   */
  managedBy?: UserProfilePasswordManagedBy;
  /** Resolve to close the dialog; reject with an `Error` to keep it open showing why. */
  onSubmitPassword?: (value: UserProfileEditPasswordValue) => Promise<void>;
}
