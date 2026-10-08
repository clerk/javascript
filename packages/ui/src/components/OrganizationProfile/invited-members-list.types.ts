import type { MembersTableData } from './active-members-list.types';

export type InvitationRowDisplay = {
  emailAddress: string;
  invitedAt: string;
  roleLabel: string | undefined;
};

export type InvitationRowModel = {
  id: string;
  view: InvitationRowDisplay;
  revoke: () => Promise<void>;
};

export type InvitedMembersListModel = {
  scope: string;
  hasOrganization: boolean;
  invitations: InvitationRowModel[];
  table: MembersTableData;
};

export type InvitationRowInteraction = {
  onRevoke: () => Promise<void>;
  isDisabled: boolean;
};

export type InvitedMembersListData = {
  table: MembersTableData;
  invitations: Array<Pick<InvitationRowModel, 'id' | 'view'> & { interaction: InvitationRowInteraction }>;
};
