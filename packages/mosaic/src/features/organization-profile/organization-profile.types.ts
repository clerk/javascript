import type { ReactNode } from 'react';

import type { OrganizationProfileGeneralPanelViewProps } from './organization-profile-general-panel.view';

export type OrganizationProfilePageId = 'general' | 'members' | 'security' | 'billing' | 'apiKeys';

export interface OrganizationProfilePages {
  general: OrganizationProfileGeneralPanelViewProps;
  members?: Record<string, never>;
  security?: Record<string, never>;
  billing?: Record<string, never>;
  apiKeys?: Record<string, never>;
}

export interface CustomOrganizationProfilePage {
  label: string;
  path: string;
  href?: never;
  icon?: ReactNode;
  content: ReactNode;
}

export interface OrganizationProfileFormError {
  message?: string;
  field?: string;
}

export class OrganizationProfileSaveError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'OrganizationProfileSaveError';
    this.field = field;
  }
}
