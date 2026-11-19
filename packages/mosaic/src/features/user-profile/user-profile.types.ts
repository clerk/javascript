import type { ReactNode } from 'react';

/** A page the UserProfile brings itself, named by the id its navigation knows it as. */
export type UserProfilePageId = 'account' | 'security' | 'billing' | 'apiKeys';

/** The built-in pages an instance shows: `account` always, the rest as the environment allows. */
export interface UserProfilePages {
  account: ReactNode;
  security?: ReactNode;
  billing?: ReactNode;
  apiKeys?: ReactNode;
}

/** A page of your own inside the profile, reached from its navigation. */
export interface CustomProfilePage {
  /** Names the page in the profile's navigation. */
  label: string;
  /** Where the page lives, relative to the profile root. Absolute URLs are rejected. */
  path: string;
  icon?: ReactNode;
  /** Rendered as the page itself. */
  content: ReactNode;
}
