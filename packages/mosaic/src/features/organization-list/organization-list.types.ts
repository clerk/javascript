export interface OrganizationListMembership {
  kind: 'membership';
  organizationId: string;
  name: string;
  imageUrl?: string;
}

export interface OrganizationListInvitation {
  kind: 'invitation';
  id: string;
  organizationId: string;
  name: string;
  imageUrl?: string;
  status: 'pending' | 'accepted';
}

export interface OrganizationListSuggestion {
  kind: 'suggestion';
  id: string;
  organizationId: string;
  name: string;
  imageUrl?: string;
  status: 'pending' | 'accepted';
}

export interface OrganizationListPaging {
  observe: (element: HTMLElement | null) => void;
  hasMore: boolean;
}

export interface OrganizationListData {
  applicationName: string;
  renderBranding: boolean;
  hidePersonal: boolean;
  personalImageUrl?: string;
  organizationsLoading: boolean;
  memberships: OrganizationListMembership[];
  invitations: OrganizationListInvitation[];
  suggestions: OrganizationListSuggestion[];
  paging: OrganizationListPaging;
}

export const organizationListBusyKeys = {
  selectOrganization: (organizationId: string | null) => `select-org:${organizationId ?? 'personal'}`,
  acceptInvitation: (invitationId: string) => `accept-invitation:${invitationId}`,
  acceptSuggestion: (suggestionId: string) => `accept-suggestion:${suggestionId}`,
} as const;
