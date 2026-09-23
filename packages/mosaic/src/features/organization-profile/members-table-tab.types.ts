export interface OrganizationProfileMember {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  joinedAtLabel: string;
  role: string;
  roleLabel: string;
  isCurrentUser?: boolean;
  isDeprovisioned?: boolean;
  isBanned?: boolean;
}

export interface MembersTableSort {
  column: 'name' | 'joinedAt' | 'role';
  direction: 'ascending' | 'descending';
}

export interface MembersTableTabViewProps {
  members: OrganizationProfileMember[];
  roles: { value: string; label: string }[];
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
  onRemove?: (id: string) => void;
  onChangeRole?: (id: string, role: string) => void;
  onBulkAction?: (ids: string[]) => void;
  sort?: MembersTableSort | null;
  onSortChange?: (sort: MembersTableSort | null) => void;
}
