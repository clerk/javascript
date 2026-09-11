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
export class UserProfileSaveError<TField extends string = string> extends Error {
  readonly fields?: Partial<Record<TField, string>>;

  constructor(message: string, fields?: Partial<Record<TField, string>>) {
    super(message);
    this.name = 'UserProfileSaveError';
    this.fields = fields;
  }
}
