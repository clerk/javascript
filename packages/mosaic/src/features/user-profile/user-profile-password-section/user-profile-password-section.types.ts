import { FormSubmitError } from '../../../components/form';
import type { UserProfileManagedBy } from '../user-profile-managed-by';

/** Plain data, so nothing downstream of the view imports a Clerk error. */
export interface UserProfileFormError<TField extends string = string> {
  /** Rendered in the dialog's negative banner. */
  message?: string;
  /** Rendered under the named control, which is also marked invalid. */
  fields?: Partial<Record<TField, string>>;
}

/** What a save rejects with when the failure names a control; a plain `Error` shows only the banner. */
export class UserProfileSaveError<TField extends string = string> extends FormSubmitError<Record<TField, unknown>> {
  constructor(message: string, fields?: Partial<Record<TField, string>>) {
    super({ message, fields });
    this.name = 'UserProfileSaveError';
  }
}

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
