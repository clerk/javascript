export type OrganizationPreviewData = {
  id: string;
  name: string;
  imageUrl: string;
  hasImage: boolean;
  slug: string | null;
};

export type MembershipRowData = {
  id: string;
  organization: OrganizationPreviewData;
  activate: () => Promise<'success' | 'unauthorized' | 'inactive' | { error: unknown }>;
};

export type InvitationRowData = {
  id: string;
  organization: OrganizationPreviewData;
  accept: () => Promise<MembershipRowData | null | undefined>;
};

export type SuggestionRowData = {
  id: string;
  organization: OrganizationPreviewData;
  status: 'pending' | 'accepted';
  accept: () => Promise<void>;
};

export type ChooseOrganizationScreenData = {
  paginationRef: (element: HTMLElement | null) => void;
  memberships: MembershipRowData[];
  invitations: InvitationRowData[];
  suggestions: SuggestionRowData[];
  isOrganizationListLoaded: boolean;
  createOrganizationEnabled: boolean;
  isLoading: boolean;
  hasNextPage: boolean;
};

export type ChooseOrganizationScreenViewProps = ChooseOrganizationScreenData & {
  error: string | undefined;
  onCreateOrganizationClick: () => void;
};

export type MembershipPreviewController = {
  onClick: () => Promise<void>;
};

export type InvitationPreviewController = {
  acceptedOrganization: MembershipRowData | null;
  onAccept: () => Promise<void>;
  isLoading: boolean;
};

export type SuggestionPreviewController = {
  onAccept: () => Promise<void>;
  isLoading: boolean;
};

export type MembershipPreviewViewProps = MembershipPreviewController & {
  organization: OrganizationPreviewData;
};

export type InvitationPreviewViewProps = Pick<InvitationPreviewController, 'onAccept' | 'isLoading'> & {
  organization: OrganizationPreviewData;
};

export type SuggestionPreviewViewProps = SuggestionPreviewController & {
  organization: OrganizationPreviewData;
  status: SuggestionRowData['status'];
};

export type ChooseOrganizationRowActionController = {
  run: () => Promise<void>;
  isLoading: boolean;
};
