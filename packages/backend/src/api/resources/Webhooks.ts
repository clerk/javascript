import type {
  CommercePaymentAttemptWebhookEventJSON,
  CommerceSubscriptionItemWebhookEventJSON,
  CommerceSubscriptionWebhookEventJSON,
  DeletedObjectJSON,
  EmailJSON,
  OrganizationDomainJSON,
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  PermissionJSON,
  RoleJSON,
  SessionJSON,
  SMSMessageJSON,
  UserJSON,
  WaitlistEntryJSON,
} from './JSON';

type WebhookEventAttributes = {
  http_request: {
    client_ip: string;
    user_agent: string;
  };
};

type Webhook<EvtType, Data> = { type: EvtType; object: 'event'; data: Data; event_attributes: WebhookEventAttributes };

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

export type OrganizationDomainWebhookEvent =
  | Webhook<'organizationDomain.created' | 'organizationDomain.updated', OrganizationDomainJSON>
  | Webhook<'organizationDomain.deleted', DeletedObjectJSON>;

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

export type WaitlistEntryWebhookEvent = Webhook<'waitlistEntry.created' | 'waitlistEntry.updated', WaitlistEntryJSON>;

export type CommercePaymentAttemptWebhookEvent = Webhook<
  'paymentAttempt.created' | 'paymentAttempt.updated',
  CommercePaymentAttemptWebhookEventJSON
>;

export type CommerceSubscriptionWebhookEvent = Webhook<
  'subscription.created' | 'subscription.updated' | 'subscription.active' | 'subscription.past_due',
  CommerceSubscriptionWebhookEventJSON
>;

export type CommerceSubscriptionItemWebhookEvent = Webhook<
  | 'subscriptionItem.created'
  | 'subscriptionItem.updated'
  | 'subscriptionItem.active'
  | 'subscriptionItem.canceled'
  | 'subscriptionItem.upcoming'
  | 'subscriptionItem.ended'
  | 'subscriptionItem.abandoned'
  | 'subscriptionItem.incomplete'
  | 'subscriptionItem.past_due',
  CommerceSubscriptionItemWebhookEventJSON
>;

export type WebhookEvent =
  | UserWebhookEvent
  | SessionWebhookEvent
  | EmailWebhookEvent
  | SMSWebhookEvent
  | OrganizationWebhookEvent
  | OrganizationDomainWebhookEvent
  | OrganizationMembershipWebhookEvent
  | OrganizationInvitationWebhookEvent
  | RoleWebhookEvent
  | PermissionWebhookEvent
  | WaitlistEntryWebhookEvent
  | CommercePaymentAttemptWebhookEvent
  | CommerceSubscriptionWebhookEvent
  | CommerceSubscriptionItemWebhookEvent;

export type WebhookEventType = WebhookEvent['type'];
