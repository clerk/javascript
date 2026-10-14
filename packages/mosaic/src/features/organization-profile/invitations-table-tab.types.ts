import type { MouseEventHandler } from 'react';

export interface OrganizationProfileInvitation {
  id: string;
  email: string;
  imageUrl?: string;
  invitedAtLabel: string;
  roleLabel: string;
}

export interface InvitationsTableTabViewProps {
  invitations: OrganizationProfileInvitation[];
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPageChange: (page: number) => void;
  onInvite?: MouseEventHandler<HTMLButtonElement>;
  onRevoke?: (id: string) => void | Promise<void>;
  onBulkAction?: (ids: string[]) => void;
}
