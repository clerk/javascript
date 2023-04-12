import type {
  DeletedObjectJSON,
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  SessionJSON,
  UserJSON,
} from './JSON';

type Webhook<EvtType, Data> = { type: EvtType; object: 'event'; data: Data };

export type UserWebhookEvent =
  | Webhook<'user.created' | 'user.updated', UserJSON>
  | Webhook<'user.deleted', DeletedObjectJSON>;

export type SessionWebhookEvent = Webhook<
  'session.created' | 'session.ended' | 'session.removed' | 'session.revoked',
  SessionJSON
>;

export type OrganizationWebhookEvent =
  | Webhook<'organization.created' | 'organization.updated', OrganizationJSON>
  | Webhook<'organization.deleted', DeletedObjectJSON>;

export type OrganizationMembershipWebhookEvent = Webhook<
  'organizationMembership.created' | 'organizationMembership.accepted' | 'organizationMembership.revoked',
  OrganizationMembershipJSON
>;

export type OrganizationInvitationWebhookEvent = Webhook<
  'organizationInvitation.created' | 'organizationInvitation.deleted' | 'organizationInvitation.updated',
  OrganizationInvitationJSON
>;

export type WebhookEvent =
  | UserWebhookEvent
  | SessionWebhookEvent
  | OrganizationWebhookEvent
  | OrganizationMembershipWebhookEvent
  | OrganizationInvitationWebhookEvent;

export type WebhookEventType = WebhookEvent['type'];
