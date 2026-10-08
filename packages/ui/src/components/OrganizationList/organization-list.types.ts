export type OrganizationListOrganization = {
  id: string;
  name: string;
  slug: string | null;
  imageUrl: string;
  hasImage: boolean;
};

export type OrganizationListMembership = {
  requestKey: string;
  canRun: () => boolean;
  isLoaded: boolean;
  organizationPreview: OrganizationListOrganization;
  selectOrganization: (canContinue?: () => boolean) => Promise<void>;
  getUnauthorizedError: () => string;
};

export type OrganizationListInvitation = {
  organizationData: OrganizationListOrganization;
  accept: () => Promise<OrganizationListMembership | undefined>;
};

export type OrganizationListSuggestion = {
  organizationData: OrganizationListOrganization;
  isAccepted: boolean;
  accept: () => Promise<void>;
};

export type OrganizationListPersonalAccount = {
  requestKey: string;
  canRun: () => boolean;
  isVisible: boolean;
  user?: {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
  };
  selectPersonal?: (canContinue?: () => boolean) => Promise<void>;
};

export type OrganizationListItemsData = {
  scopeKey: string;
  applicationName: string;
  hidePersonal: boolean;
  paginationRef: (element: HTMLElement | null) => void;
  personalAccount: OrganizationListPersonalAccount;
  memberships: Array<{ id: string; model: OrganizationListMembership }>;
  invitations: Array<{ id: string; model: OrganizationListInvitation }>;
  suggestions: Array<{ id: string; model: OrganizationListSuggestion }>;
  isLoading: boolean;
  hasNextPage: boolean;
};

export type OrganizationListMembershipViewProps = {
  isVisible: boolean;
  organizationPreview: OrganizationListOrganization;
  onClick: () => Promise<void>;
};

export type OrganizationListPersonalAccountViewProps = {
  isVisible: boolean;
  user: OrganizationListPersonalAccount['user'];
  onClick: () => void | Promise<void>;
};

export type OrganizationListAcceptButtonProps = {
  isLoading: boolean;
  onAccept: () => void;
};

export type OrganizationListInvitationViewProps = OrganizationListAcceptButtonProps & {
  organizationData: OrganizationListOrganization;
};

export type OrganizationListSuggestionViewProps = OrganizationListInvitationViewProps & {
  isAccepted: boolean;
};

export type OrganizationListPageData = {
  scopeKey: string;
  isLoading: boolean;
  showListInitially: boolean;
};

export type OrganizationListItemsViewProps = Omit<OrganizationListItemsData, 'scopeKey'> & {
  error?: string;
  onCreateOrganizationClick: () => void;
};

export type OrganizationListFlowViewProps = {
  error?: string;
  isCreateOrganizationFlow: boolean;
  onCreateOrganizationClick: () => void;
};

export type OrganizationListFlowController = OrganizationListFlowViewProps & {
  onCreateOrganizationComplete: () => void;
  onCancel?: () => void;
};
