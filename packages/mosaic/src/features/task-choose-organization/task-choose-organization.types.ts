import type { OrganizationListData } from '../organization-list/organization-list.types';

export interface TaskChooseOrganizationAdvisory {
  organizationName: string;
  organizationDomain: string;
}

export interface TaskChooseOrganizationData extends Pick<
  OrganizationListData,
  'renderBranding' | 'organizationsLoading' | 'memberships' | 'invitations' | 'suggestions' | 'paging'
> {
  identifier?: string;
  exclusiveOrganizationId: string | null;
  creationDefaults?: { name: string; slug: string };
  advisory?: TaskChooseOrganizationAdvisory;
}

export type TaskChooseOrganizationStep = 'choose' | 'create' | 'unavailable';
