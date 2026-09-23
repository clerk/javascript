export type UserProfileEditPasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

export interface UserProfileEditPasswordValue {
  currentPassword?: string;
  newPassword: string;
  signOutOfOtherSessions: boolean;
}

export interface UserProfilePasswordManagedBy {
  name: string;
  iconUrl?: string;
}

export interface UserProfilePasswordSectionViewProps {
  sectionTitle?: string;
  /** Renders only the group, for composing inside a parent `Section.Root`. */
  asGroup?: boolean;
  hasPassword?: boolean;
  requiresCurrentPassword?: boolean;
  /** Replaces the edit action with the enterprise provider’s name. */
  managedBy?: UserProfilePasswordManagedBy;
  onSubmitPassword?: (value: UserProfileEditPasswordValue) => Promise<void>;
}
