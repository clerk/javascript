import type {
  AllowlistIdentifierAPI,
  ClientAPI,
  EmailAPI,
  InvitationAPI,
  OrganizationAPI,
  SessionAPI,
  SMSMessageAPI,
  UserAPI,
} from './api/endpoints';

export type ClerkClient = {
  allowlistIdentifiers: AllowlistIdentifierAPI;
  clients: ClientAPI;
  emails: EmailAPI;
  invitations: InvitationAPI;
  organizations: OrganizationAPI;
  sessions: SessionAPI;
  smsMessages: SMSMessageAPI;
  users: UserAPI;
};

export type CreateClerkClientParams = { apiKey?: string };

export type CreateClerkClient = (params?: CreateClerkClientParams) => ClerkClient;

export const extractClerkApiFromInstance = (ins: Record<keyof ClerkClient, any>): ClerkClient => {
  return {
    allowlistIdentifiers: ins.allowlistIdentifiers,
    clients: ins.clients,
    emails: ins.emails,
    invitations: ins.invitations,
    organizations: ins.organizations,
    sessions: ins.sessions,
    smsMessages: ins.smsMessages,
    users: ins.users,
  };
};
