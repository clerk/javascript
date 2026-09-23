export interface OrganizationProfileInvitation {
  id: string;
  email: string;
  imageUrl?: string;
  invitedAtLabel: string;
  roleLabel: string;
}

export interface InvitationsTableSort {
  column: 'email' | 'invitedAt' | 'roleLabel';
  direction: 'ascending' | 'descending';
}

export interface InvitationsTableTabViewProps {
  invitations: OrganizationProfileInvitation[];
  totalCount: number;
  page: number;
  pageSize?: number;
  searchValue: string;
  isLoading: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
  onInvite?: () => void;
  onRevoke?: (id: string) => void;
  onBulkAction?: (ids: string[]) => void;
  sort?: InvitationsTableSort | null;
  onSortChange?: (sort: InvitationsTableSort | null) => void;
}
