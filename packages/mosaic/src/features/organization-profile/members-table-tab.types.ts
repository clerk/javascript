import type { RoleResource } from '@clerk/shared/types';
import type { MouseEventHandler } from 'react';

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
  onInvite?: MouseEventHandler<HTMLButtonElement>;
  onRemove?: (id: string) => void | Promise<void>;
  onChangeRole?: (id: string, role: string) => void;
  onBulkAction?: (ids: string[]) => void;
}
