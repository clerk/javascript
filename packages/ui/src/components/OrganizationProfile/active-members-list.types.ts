import type { UserPreviewData } from '@/ui/elements/user-preview.view';

export type MemberRoleOption = { label: string; value: string };

export type MemberPreview = {
  display: UserPreviewData | undefined;
  identifier: string | undefined;
  isCurrentUser: boolean;
  isDeprovisioned: boolean | undefined;
  isBanned: boolean | undefined;
};

export type MemberRowDisplay = {
  isDeprovisioned: boolean | undefined;
  date: string;
  canManageMemberships: boolean | null;
  role: string;
  roleName: string;
  localizedRoleLabel: string | undefined;
  options: MemberRoleOption[] | undefined;
};

export type MemberRowModel = {
  id: string;
  preview: MemberPreview;
  view: MemberRowDisplay;
  updateRole: (role: string) => Promise<void>;
  remove: () => Promise<void>;
};

export type MembersTableData = {
  page: number;
  onPageChange: (page: number) => void;
  itemCount: number;
  pageCount: number;
  itemsPerPage: number;
  isLoading: boolean | undefined;
};

export type ActiveMembersListModel = {
  subject: string | undefined;
  hasOrganization: boolean;
  hasRoleSetMigration: boolean;
  members: MemberRowModel[];
  table: MembersTableData;
};

export type MemberRowInteraction = {
  onRoleChange: (role: string) => Promise<void>;
  onRemove: () => Promise<void>;
  isRoleSelectDisabled: boolean;
  isRemoveDisabled: boolean;
};

export type ActiveMembersListData = {
  hasOrganization: boolean;
  table: MembersTableData;
  members: Array<Pick<MemberRowModel, 'id' | 'preview' | 'view'> & { interaction: MemberRowInteraction }>;
};
