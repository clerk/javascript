import type { RoleResource } from '@clerk/shared/types';
import type { MouseEventHandler, Ref } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';

export type MemberRole = Pick<RoleResource, 'key' | 'name'>;

export interface MembersRoles {
  roles: MemberRole[];
  hasRoleSetMigration: boolean;
}

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

export interface MembersTableTabViewProps {
  members: OrganizationProfileMember[];
  roles: { value: string; label: string }[];
  totalCount: number;
  page: number;
  pageSize: number;
  searchValue: string;
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  hasRoleSetMigration?: boolean;
  isChangingRole?: boolean;
  roleError?: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  searchInputRef?: Ref<HTMLInputElement>;
  inviteButtonRef?: Ref<HTMLButtonElement>;
  onInvite?: MouseEventHandler<HTMLButtonElement>;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  remove?: ConfirmController<OrganizationProfileMember>;
  finalFocus?: DialogFocusTarget;
  onChangeRole?: (id: string, role: string) => void;
  onBulkAction?: (ids: string[]) => void;
}
