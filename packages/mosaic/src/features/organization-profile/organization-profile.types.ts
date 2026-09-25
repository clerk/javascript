import type { ReactNode } from 'react';

import type { OrganizationProfileApiKeysPanelViewProps } from './organization-profile-api-keys-panel.types';
import type { OrganizationProfileGeneralPanelViewProps } from './organization-profile-general-panel.view';
import type { OrganizationProfileMembersPanelViewProps } from './organization-profile-members-panel.view';

export type OrganizationProfilePageId = 'general' | 'members' | 'security' | 'billing' | 'apiKeys';

export interface OrganizationProfilePages {
  general: OrganizationProfileGeneralPanelViewProps;
  members?: OrganizationProfileMembersPanelViewProps;
  security?: Record<string, never>;
  billing?: Record<string, never>;
  apiKeys?: OrganizationProfileApiKeysPanelViewProps;
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
  /** Names the control the failure belongs to. Set, and `message` renders under it instead of in the banner. */
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
