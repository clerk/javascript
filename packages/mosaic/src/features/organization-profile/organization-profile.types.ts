import type { ReactNode } from 'react';

import type { OrganizationProfileGeneralPanelViewProps } from './organization-profile-general-panel.view';
import type { OrganizationProfileMembersPanelViewProps } from './organization-profile-members-panel.view';

export type OrganizationProfilePageId = 'general' | 'members' | 'security' | 'billing' | 'apiKeys';

export interface OrganizationProfilePages {
  general: OrganizationProfileGeneralPanelViewProps;
  members?: OrganizationProfileMembersPanelViewProps;
  security?: Record<string, never>;
  billing?: Record<string, never>;
  apiKeys?: ReactNode;
}

export interface CustomOrganizationProfilePage {
  label: string;
  path: string;
  href?: never;
  icon?: ReactNode;
  content: ReactNode;
}
