import type { MouseEventHandler } from 'react';

import type { OrganizationProfileCreateAPIKeyDialogProps } from './organization-profile-create-api-key.dialog';

export interface OrganizationProfileAPIKey {
  id: string;
  name: string;
  createdAtLabel: string;
  expiresAtLabel: string | null;
  lastUsedAtLabel: string | null;
}

export interface OrganizationProfileApiKeysPanelViewProps {
  apiKeys: OrganizationProfileAPIKey[];
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
  createDialog?: OrganizationProfileCreateAPIKeyDialogProps;
  onRevoke?: (id: string) => Promise<void>;
}
