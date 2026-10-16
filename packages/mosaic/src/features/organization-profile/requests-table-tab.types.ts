import type { MouseEventHandler, Ref } from 'react';

export interface OrganizationProfileRequest {
  id: string;
  email: string;
  name?: string;
  imageUrl?: string;
  requestedAtLabel: string;
  pendingAction?: 'accept' | 'decline';
}

export interface RequestsTableTabViewProps {
  requests: OrganizationProfileRequest[];
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPageChange: (page: number) => void;
  inviteButtonRef?: Ref<HTMLButtonElement>;
  tableContainerRef?: Ref<HTMLDivElement>;
  onInvite?: MouseEventHandler<HTMLButtonElement>;
  registerAcceptTrigger?: (id: string) => Ref<HTMLButtonElement>;
  registerDeclineTrigger?: (id: string) => Ref<HTMLButtonElement>;
  onAccept?: (id: string) => void | Promise<void>;
  onDecline?: (id: string) => void | Promise<void>;
  onBulkAction?: (ids: string[]) => void;
}
