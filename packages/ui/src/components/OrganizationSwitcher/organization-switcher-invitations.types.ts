export type OrganizationSwitcherInvitationOrganization = {
  id: string;
  name: string;
  slug: string | null;
  imageUrl: string;
  hasImage: boolean;
};

export type OrganizationSwitcherAcceptedOrganization = {
  id: string;
  onClick: () => unknown;
};

export type OrganizationSwitcherInvitationData = {
  id: string;
  organizationData: OrganizationSwitcherInvitationOrganization;
  isAccepted: boolean;
  activeOrganizationId: string | undefined;
  acceptedOrganization: OrganizationSwitcherAcceptedOrganization | undefined;
  accept: () => Promise<OrganizationSwitcherAcceptedOrganization | undefined>;
};

export type OrganizationSwitcherSuggestionData = {
  id: string;
  organizationData: OrganizationSwitcherInvitationOrganization;
  isAccepted: boolean;
  accept: () => Promise<void>;
};

export type OrganizationSwitcherInvitationsDisplayData = {
  isVisible: boolean;
  invitationHasNextPage: boolean;
  hasNextPage: boolean;
  isLoading: boolean;
  paginationRef: (element: HTMLElement | null) => void;
};

export type OrganizationSwitcherInvitationsData = OrganizationSwitcherInvitationsDisplayData & {
  scopeKey: string;
  invitations: OrganizationSwitcherInvitationData[];
  suggestions: OrganizationSwitcherSuggestionData[];
};

export type OrganizationSwitcherInvitationViewProps = {
  organizationData: OrganizationSwitcherInvitationOrganization;
  isAccepted: boolean;
  isHidden: boolean;
  isLoading: boolean;
  onAcceptedClick: (() => unknown) | undefined;
  onAccept: () => Promise<void>;
};

export type OrganizationSwitcherSuggestionViewProps = {
  isAccepted: boolean;
  isLoading: boolean;
  onAccept: () => Promise<void>;
};
