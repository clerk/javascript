import type { ReactNode } from 'react';

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

export interface UserProfilePasswordManagedBy {
  name: string;
}

export interface UserProfilePasswordSectionViewProps {
  action?: ReactNode;
  hasPassword?: boolean;
  /** Replaces the edit action with the enterprise provider’s name. */
  managedBy?: UserProfilePasswordManagedBy;
}

export interface UserProfilePasswordSlot {
  content: ReactNode;
}
