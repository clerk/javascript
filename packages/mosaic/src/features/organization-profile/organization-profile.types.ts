import type { OrganizationProfileApiKeysPanelViewProps } from './organization-profile-api-keys-panel.view';
import type { OrganizationProfileBillingPanelViewProps } from './organization-profile-billing-panel.view';
import type { OrganizationProfileGeneralPanelViewProps } from './organization-profile-general-panel.view';
import type { OrganizationProfileMembersPanelViewProps } from './organization-profile-members-panel.view';
import type { OrganizationProfileSecurityPanelViewProps } from './organization-profile-security-panel.view';

export type { CustomProfileItem, CustomProfileLink, CustomProfilePage } from '../user-profile/user-profile.types';

/** A page the OrganizationProfile brings itself, named by the id its navigation knows it as. */
export type OrganizationProfilePageId = 'general' | 'members' | 'security' | 'billing' | 'apiKeys';

/** The built-in pages an instance shows: `general` always, the rest as the environment allows. */
export interface OrganizationProfilePages {
  general: OrganizationProfileGeneralPanelViewProps;
  members?: OrganizationProfileMembersPanelViewProps;
  security?: OrganizationProfileSecurityPanelViewProps;
  billing?: OrganizationProfileBillingPanelViewProps;
  apiKeys?: OrganizationProfileApiKeysPanelViewProps;
}
