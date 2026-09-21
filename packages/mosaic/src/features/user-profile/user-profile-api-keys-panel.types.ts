import type { MouseEventHandler } from 'react';

export interface UserProfileAPIKey {
  id: string;
  name: string;
  createdAtLabel: string;
  expiresAtLabel: string | null;
  lastUsedAtLabel: string | null;
}

export interface UserProfileAPIKeySort {
  column: 'name' | 'createdAt' | 'lastUsed';
  direction: 'ascending' | 'descending';
}

export interface UserProfileApiKeysPanelViewProps {
  apiKeys: UserProfileAPIKey[];
  totalCount: number;
  page: number;
  pageSize?: number;
  searchValue: string;
  isLoading: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
  onCreate?: MouseEventHandler<HTMLButtonElement>;
  onRevoke?: (id: string) => Promise<void>;
  onBulkAction?: (ids: string[]) => void;
  sort?: UserProfileAPIKeySort | null;
  onSortChange?: (sort: UserProfileAPIKeySort | null) => void;
}
