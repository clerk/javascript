import type { ReactNode } from 'react';

export type OrganizationProfilePageId = 'general' | 'members' | 'security' | 'billing' | 'apiKeys';

export interface OrganizationProfilePages {
  general: ReactNode;
  members?: ReactNode;
  security?: ReactNode;
  billing?: ReactNode;
  apiKeys?: ReactNode;
}

export interface CustomOrganizationProfilePage {
  label: string;
  path: string;
  href?: never;
  icon?: ReactNode;
  /** Other words that find the page in the profile's search. */
  keywords?: readonly string[];
  content: ReactNode;
}

/** What the organization's navigation is built from. */
export interface OrganizationProfilePageListOptions {
  /** The built-in pages. One left undefined is left out of the navigation. */
  pages: OrganizationProfilePages;
  /** Pages of the consumer's own, added to the navigation after the built-ins. */
  customPages?: readonly CustomOrganizationProfilePage[];
  /**
   * The order the navigation runs in, by id: a built-in page's id, or a custom page's `path`. Ids
   * left out keep their default place behind the ones named.
   */
  pageOrder?: readonly (OrganizationProfilePageId | (string & {}))[];
}
