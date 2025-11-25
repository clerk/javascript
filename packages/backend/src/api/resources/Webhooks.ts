import type {
  BillingPaymentAttemptWebhookEventJSON,
  BillingSubscriptionItemWebhookEventJSON,
  BillingSubscriptionWebhookEventJSON,
  DeletedObjectJSON,
  EmailJSON,
  OrganizationDomainJSON,
  OrganizationInvitationAcceptedJSON,
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  PermissionJSON,
  RoleJSON,
  SessionWebhookEventJSON,
  SMSMessageJSON,
  UserDeletedJSON,
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
  | Webhook<'user.deleted', UserDeletedJSON>;

export type EmailWebhookEvent = Webhook<'email.created', EmailJSON>;

export type SMSWebhookEvent = Webhook<'sms.created', SMSMessageJSON>;

export type SessionWebhookEvent = Webhook<
  'session.created' | 'session.ended' | 'session.removed' | 'session.revoked',
  SessionWebhookEventJSON
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
  'organizationInvitation.created' | 'organizationInvitation.revoked',
  OrganizationInvitationJSON
>;

export type OrganizationInvitationAcceptedWebhookEvent = Webhook<
  'organizationInvitation.accepted',
  OrganizationInvitationAcceptedJSON
>;

export type RoleWebhookEvent = Webhook<'role.created' | 'role.updated' | 'role.deleted', RoleJSON>;

export type PermissionWebhookEvent = Webhook<
  'permission.created' | 'permission.updated' | 'permission.deleted',
  PermissionJSON
>;

export type WaitlistEntryWebhookEvent = Webhook<'waitlistEntry.created' | 'waitlistEntry.updated', WaitlistEntryJSON>;

export type BillingPaymentAttemptWebhookEvent = Webhook<
  'paymentAttempt.created' | 'paymentAttempt.updated',
  BillingPaymentAttemptWebhookEventJSON
>;

export type BillingSubscriptionWebhookEvent = Webhook<
  'subscription.created' | 'subscription.updated' | 'subscription.active' | 'subscription.pastDue',
  BillingSubscriptionWebhookEventJSON
>;

export type BillingSubscriptionItemWebhookEvent = Webhook<
  | 'subscriptionItem.created'
  | 'subscriptionItem.updated'
  | 'subscriptionItem.active'
  | 'subscriptionItem.canceled'
  | 'subscriptionItem.upcoming'
  | 'subscriptionItem.ended'
  | 'subscriptionItem.abandoned'
  | 'subscriptionItem.incomplete'
  | 'subscriptionItem.pastDue'
  | 'subscriptionItem.freeTrialEnding',
  BillingSubscriptionItemWebhookEventJSON
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
  | OrganizationInvitationAcceptedWebhookEvent
  | RoleWebhookEvent
  | PermissionWebhookEvent
  | WaitlistEntryWebhookEvent
  | BillingPaymentAttemptWebhookEvent
  | BillingSubscriptionWebhookEvent
  | BillingSubscriptionItemWebhookEvent;

export type WebhookEventType = WebhookEvent['type'];
