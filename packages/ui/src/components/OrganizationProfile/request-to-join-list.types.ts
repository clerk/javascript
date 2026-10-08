import type { MembersTableData } from './active-members-list.types';

export type RequestRowDisplay = {
  identifier: string;
  requestedAt: string;
};

export type RequestRowModel = {
  id: string;
  view: RequestRowDisplay;
  accept: () => Promise<void>;
  reject: () => Promise<void>;
};

export type RequestToJoinListModel = {
  scope: string;
  hasOrganization: boolean;
  canAct: boolean;
  requests: RequestRowModel[];
  table: MembersTableData;
};

export type RequestRowInteraction = {
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
  acceptIsLoading: boolean;
  rejectIsLoading: boolean;
  acceptIsDisabled: boolean;
  rejectIsDisabled: boolean;
};

export type RequestToJoinListData = {
  table: MembersTableData;
  requests: Array<Pick<RequestRowModel, 'id' | 'view'> & { interaction: RequestRowInteraction }>;
};
