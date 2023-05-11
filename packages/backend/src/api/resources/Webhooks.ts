import type {
  DeletedObjectJSON,
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  SessionJSON,
  UserJSON,
} from './JSON';
import type { EmailJSON, SMSMessageJSON } from './JSON';

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

export type WebhookEvent =
  | UserWebhookEvent
  | SessionWebhookEvent
  | EmailWebhookEvent
  | SMSWebhookEvent
  | OrganizationWebhookEvent
  | OrganizationMembershipWebhookEvent
  | OrganizationInvitationWebhookEvent;

export type WebhookEventType = WebhookEvent['type'];
