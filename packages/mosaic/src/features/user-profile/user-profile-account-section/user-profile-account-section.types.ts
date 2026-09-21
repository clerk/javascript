import { FormSubmitError } from '../../../components/form';

/** Plain data, so nothing downstream of the model imports a Clerk error. */
export interface UserProfileFormError<TField extends string = string> {
  /** Rendered in the dialog's negative banner. */
  message?: string;
  /** Rendered under the named control, which is also marked invalid. */
  fields?: Partial<Record<TField, string>>;
}

export type UserProfileSaveFailure<TField extends string = never> =
  | { kind: 'cancelled' }
  | ({ kind: 'form' } & UserProfileFormError<TField>);

export interface UserProfileSaveResult<TField extends string = never> {
  error: UserProfileSaveFailure<TField> | null;
}

export function formErrorOf<TField extends string>(
  failure: UserProfileSaveFailure<TField> | null,
): UserProfileFormError<TField> | undefined {
  if (failure?.kind !== 'form') {
    return undefined;
  }
  const { kind: _kind, ...error } = failure;
  return error;
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
