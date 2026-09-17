import type { ReactNode } from 'react';

import type { UserProfileApiKeysPanelViewProps } from './user-profile-api-keys-panel.view';
import type { UserProfileBillingPanelViewProps } from './user-profile-billing-panel.view';
import type { UserProfileProfilePanelViewProps } from './user-profile-profile-panel.view';
import type { UserProfileSecurityPanelViewProps } from './user-profile-security-panel.view';

/** A page the UserProfile brings itself, named by the id its navigation knows it as. */
export type UserProfilePageId = 'account' | 'security' | 'billing' | 'apiKeys';

/** The built-in pages an instance shows: `account` always, the rest as the environment allows. */
export interface UserProfilePages {
  account: UserProfileProfilePanelViewProps;
  security?: UserProfileSecurityPanelViewProps;
  billing?: UserProfileBillingPanelViewProps;
  apiKeys?: UserProfileApiKeysPanelViewProps;
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
