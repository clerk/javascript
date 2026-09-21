import { FormSubmitError } from '../../../components/form';

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

export interface UserProfilePhone {
  id: string;
  value: string;
  isDefault?: boolean;
  isVerified?: boolean;
  canRemove?: boolean;
}

export interface UserProfileEmail {
  id: string;
  value: string;
  isDefault?: boolean;
  isVerified?: boolean;
  canRemove?: boolean;
}