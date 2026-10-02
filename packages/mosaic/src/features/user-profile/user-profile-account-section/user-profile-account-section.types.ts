import { FormSubmitError } from '../../../components/form';

/** Plain data, so nothing downstream of the model imports a Clerk error. */
export interface UserProfileFormError<TField extends string = string> {
  /** Rendered in the dialog's negative banner. */
  message?: string;
  /** Rendered under the named control, which is also marked invalid. */
  fields?: Partial<Record<TField, string>>;
}

/** One name attribute as the instance configures it. Supplied from `userSettings.attributes.first_name` and `last_name`. */
export interface UserProfileNameAttribute {
  /** @default true */
  enabled?: boolean;
  /** @default false */
  required?: boolean;
}

/** What a save rejects with when the failure names a control; a plain `Error` shows only the banner. */
export class UserProfileSaveError<TField extends string = string> extends FormSubmitError<Record<TField, unknown>> {
  constructor(message: string, fields?: Partial<Record<TField, string>>) {
    super({ message, fields });
    this.name = 'UserProfileSaveError';
  }
}

export interface UserProfileContact {
  id: string;
  value: string;
  isDefault: boolean;
  isVerified: boolean;
}

export type UserProfileEmail = UserProfileContact;

export type UserProfilePhone = UserProfileContact;

export type UserProfileEmailVerification =
  | { method: 'code'; sent: Promise<void> }
  | { method: 'link'; verified: Promise<void>; cancel: () => void }
  | { method: 'sso'; verified: Promise<void>; cancel: () => void; connect: () => void };

export interface UserProfileEmailVerifier {
  start: () => UserProfileEmailVerification;
  verifyCode: (code: string) => Promise<void>;
}

export interface UserProfilePhoneVerifier {
  sendCode: () => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
}
