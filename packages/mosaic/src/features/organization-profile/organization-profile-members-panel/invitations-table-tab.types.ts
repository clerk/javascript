import type { MouseEventHandler, Ref } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';

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
  inviteButtonRef?: Ref<HTMLButtonElement>;
  tableContainerRef?: Ref<HTMLDivElement>;
  onInvite?: MouseEventHandler<HTMLButtonElement>;
  isInviteDisabled?: boolean;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  revoke?: ConfirmController<OrganizationProfileInvitation>;
  finalFocus?: DialogFocusTarget;
  onBulkAction?: (ids: string[]) => void;
}
