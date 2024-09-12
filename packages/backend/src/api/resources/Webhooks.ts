import type {
  DeletedObjectJSON,
  EmailJSON,
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  PermissionJSON,
  RoleJSON,
  SessionJSON,
  SMSMessageJSON,
  UserJSON,
} from './JSON';

type Webhook<EvtType, Data> = { type: EvtType; object: 'event'; data: Data };

export type UserWebhookEvent =
  | Webhook<'user.created' | 'user.updated', UserJSON>
  | Webhook<'user.deleted', DeletedObjectJSON>;

export type EmailWebhookEvent = Webhook<'email.created', EmailJSON>;

export type SMSWebhookEvent = Webhook<'sms.created', SMSMessageJSON>;

export type SessionWebhookEvent = Webhook<
  'session.created' | 'session.ended' | 'session.removed' | 'session.revoked',
  SessionJSON
>;

export type OrganizationWebhookEvent =
  | Webhook<'organization.created' | 'organization.updated', OrganizationJSON>
  | Webhook<'organization.deleted', DeletedObjectJSON>;

export type OrganizationMembershipWebhookEvent = Webhook<
  'organizationMembership.created' | 'organizationMembership.deleted' | 'organizationMembership.updated',
  OrganizationMembershipJSON
>;

export type OrganizationInvitationWebhookEvent = Webhook<
  'organizationInvitation.accepted' | 'organizationInvitation.created' | 'organizationInvitation.revoked',
  OrganizationInvitationJSON
>;

export type RoleWebhookEvent = Webhook<'role.created' | 'role.updated' | 'role.deleted', RoleJSON>;

export type PermissionWebhookEvent = Webhook<
  'permission.created' | 'permission.updated' | 'permission.deleted',
  PermissionJSON
>;

export type WebhookEvent =
  | UserWebhookEvent
  | SessionWebhookEvent
  | EmailWebhookEvent
  | SMSWebhookEvent
  | OrganizationWebhookEvent
  | OrganizationMembershipWebhookEvent
  | OrganizationInvitationWebhookEvent
  | RoleWebhookEvent
  | PermissionWebhookEvent;

export type WebhookEventType = WebhookEvent['type'];
