export interface OrganizationProfileRequest {
  id: string;
  email: string;
  name?: string;
  imageUrl?: string;
  requestedAtLabel: string;
  pendingAction?: 'accept' | 'decline';
}

export interface RequestsTableSort {
  column: 'email' | 'requestedAt';
  direction: 'ascending' | 'descending';
}

export interface RequestsTableTabViewProps {
  requests: OrganizationProfileRequest[];
  totalCount: number;
  page: number;
  pageSize?: number;
  searchValue: string;
  isLoading: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onBulkAction?: (ids: string[]) => void;
  sort?: RequestsTableSort | null;
  onSortChange?: (sort: RequestsTableSort | null) => void;
}
