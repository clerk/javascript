import type { UserProfileManagedBy } from '../user-profile-managed-by';

export type UserProfileEditPasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

export interface UserProfileEditPasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  signOutOfOtherSessions: boolean;
}

export interface UserProfileEditPasswordValue {
  currentPassword?: string;
  newPassword: string;
  signOutOfOtherSessions: boolean;
}

export interface UserProfilePasswordSectionViewProps {
  sectionTitle?: string;
  hasPassword?: boolean;
  requiresCurrentPassword?: boolean;
  /** Replaces the edit action with the enterprise provider’s name. */
  managedBy?: UserProfileManagedBy;
  onSubmitPassword?: (value: UserProfileEditPasswordValue) => Promise<void>;
}
