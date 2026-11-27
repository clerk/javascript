import type { MosaicMessages } from '../../localization';

export type LogEventType =
  | 'organizationUpdated'
  | 'organizationLogoUpdated'
  | 'memberInvited'
  | 'invitationAccepted'
  | 'invitationRevoked'
  | 'memberAdded'
  | 'memberRoleChanged'
  | 'memberRemoved'
  | 'membershipRequestAccepted'
  | 'domainAdded'
  | 'domainVerified'
  | 'domainEnrollmentModeUpdated'
  | 'paymentMethodAdded'
  | 'subscriptionCanceled'
  | 'signedIn'
  | 'ssoBypassUserAdded';

export interface LogActor {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export interface LogRecord {
  id: string;
  type: LogEventType;
  code: string;
  actor: LogActor;
  target: string | null;
  ipAddress: string;
  location: string | null;
  device: string | null;
  occurredAt: Date;
}

export interface LogEntry {
  id: string;
  code: string;
  eventLabel: string;
  actor: LogActor;
  target: string | null;
  ipAddress: string;
  location: string | null;
  device: string | null;
  timestampLabel: string;
  fullTimestampLabel: string;
}

type Strings<T> = { readonly [K in keyof T]: T[K] extends string ? string : Strings<T[K]> };

export type LogsTableMessages = Strings<MosaicMessages['logsTable']>;

export interface LogsTableViewProps {
  messages: LogsTableMessages;
  logs: LogEntry[];
  totalCount: number;
  page: number;
  pageSize?: number;
  searchValue: string;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
}
