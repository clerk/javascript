import type { LogActor, LogEventType, LogRecord } from './logs-table.types';

const EVENT_CODES: Record<LogEventType, string> = {
  organizationUpdated: 'organization.updated',
  organizationLogoUpdated: 'organization.logo.updated',
  memberInvited: 'organization_invitation.created',
  invitationAccepted: 'organization_invitation.accepted',
  invitationRevoked: 'organization_invitation.revoked',
  memberAdded: 'organization_membership.created',
  memberRoleChanged: 'organization_membership.updated',
  memberRemoved: 'organization_membership.deleted',
  membershipRequestAccepted: 'organization_membership_request.accepted',
  domainAdded: 'organization_domain.created',
  domainVerified: 'organization_domain.ownership_verified',
  domainEnrollmentModeUpdated: 'organization_domain.enrollment_mode.updated',
  paymentMethodAdded: 'organization.payment_method.created',
  subscriptionCanceled: 'organization.subscription_item.canceled',
  signedIn: 'session.created',
  ssoBypassUserAdded: 'sso_bypass_allowlist.user.added',
};

interface SampleMember extends LogActor {
  ipAddress: string;
  location: string;
  device: string;
}

const maria: SampleMember = {
  id: 'user_maria',
  name: 'Maria Garcia',
  email: 'maria@acme.com',
  ipAddress: '203.0.113.24',
  location: 'San Francisco, US',
  device: 'Chrome 130 on macOS',
};

const liam: SampleMember = {
  id: 'user_liam',
  name: 'Liam Chen',
  email: 'liam@acme.com',
  ipAddress: '198.51.100.7',
  location: 'Toronto, CA',
  device: 'Safari 18 on macOS',
};

const priya: SampleMember = {
  id: 'user_priya',
  name: 'Priya Patel',
  email: 'priya@acme.com',
  ipAddress: '2001:db8:85a3::8a2e:370:7334',
  location: 'Bengaluru, IN',
  device: 'Firefox 131 on Windows',
};

const jordan: SampleMember = {
  id: 'user_jordan',
  name: 'Jordan Smith',
  email: 'jordan@acme.com',
  ipAddress: '192.0.2.146',
  location: 'London, GB',
  device: 'Edge 130 on Windows',
};

const aisha: SampleMember = {
  id: 'user_aisha',
  name: 'Aisha Bello',
  email: 'aisha@acme.com',
  ipAddress: '203.0.113.88',
  location: 'Lagos, NG',
  device: 'Safari 18 on iOS',
};

const tom: SampleMember = {
  id: 'user_tom',
  name: 'Tom Becker',
  email: 'tom@acme.com',
  ipAddress: '198.51.100.212',
  location: 'Berlin, DE',
  device: 'Chrome 130 on Linux',
};

const SAMPLE_EVENTS: [LogEventType, SampleMember, string | null, number][] = [
  ['signedIn', liam, null, 0.4],
  ['memberRoleChanged', maria, 'tom@acme.com → Admin', 2],
  ['memberInvited', jordan, 'sam@acme.com', 5],
  ['invitationAccepted', aisha, null, 9],
  ['domainVerified', maria, 'acme.com', 20],
  ['paymentMethodAdded', priya, 'Visa ending in 4242', 26],
  ['memberInvited', maria, 'aisha@acme.com', 31],
  ['organizationUpdated', maria, 'Name: Acme Inc → Acme', 44],
  ['memberRemoved', jordan, 'chris@acme.com', 52],
  ['invitationRevoked', jordan, 'contractor@example.com', 57],
  ['domainAdded', maria, 'acme.com', 68],
  ['subscriptionCanceled', priya, 'Pro (monthly)', 74],
  ['invitationAccepted', tom, null, 80],
  ['memberInvited', liam, 'tom@acme.com', 83],
  ['memberRoleChanged', maria, 'jordan@acme.com → Admin', 96],
  ['ssoBypassUserAdded', liam, 'priya@acme.com', 110],
  ['organizationLogoUpdated', jordan, null, 129],
  ['membershipRequestAccepted', jordan, 'priya@acme.com', 141],
  ['domainEnrollmentModeUpdated', maria, 'acme.com → Automatic suggestion', 144],
  ['invitationRevoked', maria, 'old-intern@acme.com', 160],
  ['signedIn', liam, null, 175],
  ['invitationAccepted', jordan, null, 190],
  ['memberInvited', maria, 'jordan@acme.com', 192],
  ['memberRoleChanged', maria, 'liam@acme.com → Admin', 214],
  ['paymentMethodAdded', maria, 'Mastercard ending in 8210', 230],
  ['invitationAccepted', liam, null, 260],
  ['memberInvited', maria, 'liam@acme.com', 263],
  ['organizationUpdated', maria, 'Slug: acme-inc → acme', 290],
  ['memberRemoved', maria, 'test-account@acme.com', 320],
  ['memberAdded', maria, null, 340],
];

const SAMPLE_NOW = Date.UTC(2026, 9, 21, 18, 30);
const HOUR = 60 * 60 * 1000;

export const SAMPLE_LOGS: LogRecord[] = SAMPLE_EVENTS.map(([type, member, target, hoursAgo], index) => ({
  id: `log_${String(SAMPLE_EVENTS.length - index).padStart(6, '0')}`,
  type,
  code: EVENT_CODES[type],
  actor: { id: member.id, name: member.name, email: member.email },
  target,
  ipAddress: member.ipAddress,
  location: member.location,
  device: member.device,
  occurredAt: new Date(SAMPLE_NOW - hoursAgo * HOUR),
}));
