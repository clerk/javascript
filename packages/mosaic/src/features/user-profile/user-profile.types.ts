import type { ReactNode } from 'react';

import { FormSubmitError } from '../../components/form';
import type { UserProfileBillingPanelViewProps } from './user-profile-billing-panel.view';
import type { UserProfileProfilePanelViewProps } from './user-profile-profile-panel.view';
import type { UserProfileSecurityPanelViewProps } from './user-profile-security-panel.view';

/** Plain data, so nothing downstream of the model imports a Clerk error. */
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

/** A page the UserProfile brings itself, named by the id its navigation knows it as. */
export type UserProfilePageId = 'account' | 'security' | 'billing' | 'apiKeys';

/** The built-in pages an instance shows: `account` always, the rest as the environment allows. */
export interface UserProfilePages {
  account: UserProfileProfilePanelViewProps;
  security?: UserProfileSecurityPanelViewProps;
  billing?: UserProfileBillingPanelViewProps;
  apiKeys?: ReactNode;
}

/** A page of your own inside the profile, reached from its navigation. */
export interface CustomProfilePage {
  /** Names the page in the profile's navigation. */
  label: string;
  /** Where the page lives, relative to the profile root. Absolute URLs are rejected. */
  path: string;
  href?: never;
  icon?: ReactNode;
  /** Rendered as the page itself. */
  content: ReactNode;
}

/** A row in the profile's navigation that leaves for somewhere else. */
export interface CustomProfileLink {
  /** Names the row in the profile's navigation. */
  label: string;
  /** Identifies the row, for ordering. */
  path: string;
  /** Where the row goes. */
  href: string;
  icon?: ReactNode;
  content?: never;
}

export type CustomProfileItem = CustomProfilePage | CustomProfileLink;
