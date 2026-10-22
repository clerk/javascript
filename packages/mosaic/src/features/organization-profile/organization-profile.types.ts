import type { ReactNode } from 'react';

export type OrganizationProfilePageId = 'general' | 'members' | 'security' | 'billing' | 'apiKeys' | 'logs';

export interface OrganizationProfilePages {
  general: ReactNode;
  members?: ReactNode;
  security?: ReactNode;
  billing?: ReactNode;
  apiKeys?: ReactNode;
  logs?: ReactNode;
}

export interface CustomOrganizationProfilePage {
  label: string;
  path: string;
  href?: never;
  icon?: ReactNode;
  content: ReactNode;
}
