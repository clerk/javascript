import {
  AllowlistIdentifier,
  AllowlistIdentifierJSON,
  Client,
  ClientJSON,
  deserialize,
  Email,
  EmailJSON,
  Invitation,
  InvitationJSON,
  ObjectType,
  Organization,
  OrganizationInvitation,
  OrganizationJSON,
  OrganizationMembership,
  Session,
  SessionJSON,
  SMSMessage,
  SMSMessageJSON,
} from '../../api/resources';

const allowlistIdentifierJSON: AllowlistIdentifierJSON = {
  object: ObjectType.AllowlistIdentifier,
  id: 'alid_wxyz',
  identifier: 'test@example.com',
  created_at: 1612378465,
  updated_at: 1612378465,
};

const emailJSON: EmailJSON = {
  object: ObjectType.Email,
  id: 'ema_dvorak',
  from_email_name: 'sales',
  to_email_address: 'accounting@cyberdyne.com',
  email_address_id: 'idn_snafu',
  subject: 'Business trip reimbursement',
  body: 'Please find attached the invoices for expenses made during the visit to NY.',
  status: 'queued',
};

const invitationJSON: InvitationJSON = {
  object: ObjectType.Invitation,
  id: 'inv_randomid',
  email_address: 'invitation@example.com',
  created_at: 1612378465,
  updated_at: 1612378465,
  public_metadata: null,
};

const organizationJSON: OrganizationJSON = {
  object: ObjectType.Organization,
  id: 'org_randomid',
  name: 'Acme Inc',
  slug: 'acme-inc',
  logo_url: null,
  created_at: 1612378465,
  updated_at: 1612378465,
  public_metadata: { hello: 'world' },
};

const organizationInvitationJSON = {
  object: 'organization_invitation',
  id: 'orginv_randomid',
  email_address: 'invitation@example.com',
  organization_id: 'org_randomid',
  role: 'basic_member',
  redirectUrl: null,
  status: 'pending',
};

const organizationMembershipJSON = {
  object: 'organization_membership',
  id: 'orgmem_randomid',
  role: 'basic_member',
  organization: organizationJSON,
  public_user_data: {
    first_name: 'John',
    last_name: 'Doe',
    profile_image_url: 'https://url-to-image.png',
    identifier: 'johndoe@example.com',
    user_id: 'user_randomid',
  },
  created_at: 1612378465,
  updated_at: 1612378465,
  slug: 'OrgRandomId',
  logo_url: null,
  public_metadata: { hello: 'world' },
};

const sessionJSON: SessionJSON = {
  object: ObjectType.Session,
  id: 'sess_efgh',
  client_id: 'client_wxyz',
  user_id: 'user_rock',
  status: 'active',
  last_active_at: 1612378465,
  expire_at: 1612378465,
  abandon_at: 1612378465,
  created_at: 1612378465,
  updated_at: 1612378465,
};

const clientJSON: ClientJSON = {
  object: ObjectType.Client,
  id: 'client_wxyz',
  session_ids: ['sess_abcd', 'sess_efgh'],
  sessions: [sessionJSON],
  sign_in_attempt_id: null,
  sign_up_attempt_id: null,
  sign_in_id: null,
  sign_up_id: null,
  last_active_session_id: 'sess_efgh',
  created_at: 1612378465,
  updated_at: 1612378465,
};

const smsMessageJSON: SMSMessageJSON = {
  object: ObjectType.SmsMessage,
  id: 'sms_qwerty',
  from_phone_number: '+12345551001',
  to_phone_number: '+12345551001',
  phone_number_id: 'idn_foobar',
  message: "Don't forget to bring a towel",
  status: 'queued',
};

test('deserializes an AllowlistIdentifier object', () => {
  const allowlistIdentifier = deserialize(allowlistIdentifierJSON);
  expect(allowlistIdentifier).toBeInstanceOf(AllowlistIdentifier);
});

test('deserializes an array of AllowlistIdentifier objects', () => {
  const allowlistIdentifiers = deserialize([allowlistIdentifierJSON]);
  expect(allowlistIdentifiers).toBeInstanceOf(Array);
  expect(allowlistIdentifiers.length).toBe(1);
  expect(allowlistIdentifiers[0]).toBeInstanceOf(AllowlistIdentifier);
});

test('deserializes a Client object', () => {
  const client = deserialize(clientJSON);
  expect(client).toBeInstanceOf(Client);
});

test('deserializes an array of Client objects', () => {
  const clients = deserialize([clientJSON]);
  expect(clients).toBeInstanceOf(Array);
  expect(clients.length).toBe(1);
  expect(clients[0]).toBeInstanceOf(Client);
});

test('deserializes an Email object', () => {
  const email = deserialize(emailJSON);
  expect(email).toBeInstanceOf(Email);
});

test('deserializes an Invitation object', () => {
  const invitation = deserialize(invitationJSON);
  expect(invitation).toBeInstanceOf(Invitation);
});

test('deserializes an array of Invitation objects', () => {
  const invitations = deserialize([invitationJSON]);
  expect(invitations).toBeInstanceOf(Array);
  expect(invitations.length).toBe(1);
  expect(invitations[0]).toBeInstanceOf(Invitation);
});

test('deserializes an Organization object', () => {
  const organization = deserialize(organizationJSON);
  expect(organization).toBeInstanceOf(Organization);
});

test('deserializes an array of Organization objects', () => {
  const organizations = deserialize([organizationJSON]);
  expect(organizations).toBeInstanceOf(Array);
  expect(organizations.length).toBe(1);
  expect(organizations[0]).toBeInstanceOf(Organization);
});

test('deserializes an OrganizationInvitation object', () => {
  const organizationInvitation = deserialize(organizationInvitationJSON);
  expect(organizationInvitation).toBeInstanceOf(OrganizationInvitation);
});

test('deserializes an array of OrganizationInvitation objects', () => {
  const organizationInvitations = deserialize([organizationInvitationJSON]);
  expect(organizationInvitations).toBeInstanceOf(Array);
  expect(organizationInvitations.length).toBe(1);
  expect(organizationInvitations[0]).toBeInstanceOf(OrganizationInvitation);
});

test('deserializes a paginated response of OrganizationInvitation objects', () => {
  const organizationInvitations = deserialize({
    data: [organizationInvitationJSON],
  });
  expect(organizationInvitations).toBeInstanceOf(Array);
  expect(organizationInvitations.length).toBe(1);
  expect(organizationInvitations[0]).toBeInstanceOf(OrganizationInvitation);
});

test('deserializes an OrganizationMembership object', () => {
  const organizationMembership = deserialize(organizationMembershipJSON);
  expect(organizationMembership).toBeInstanceOf(OrganizationMembership);
});

test('deserializes an array of OrganizationMembership objects', () => {
  const organizationMemberships = deserialize([organizationMembershipJSON]);
  expect(organizationMemberships).toBeInstanceOf(Array);
  expect(organizationMemberships.length).toBe(1);
  expect(organizationMemberships[0]).toBeInstanceOf(OrganizationMembership);
});

test('deserializes a paginated response of OrganizationMembership objects', () => {
  const organizationMemberships = deserialize({
    data: [organizationMembershipJSON],
  });
  expect(organizationMemberships).toBeInstanceOf(Array);
  expect(organizationMemberships.length).toBe(1);
  expect(organizationMemberships[0]).toBeInstanceOf(OrganizationMembership);
});

test('deserializes a Session object', () => {
  const session = deserialize(sessionJSON);
  expect(session).toBeInstanceOf(Session);
});

test('deserializes an array of Session objects', () => {
  const sessions = deserialize([sessionJSON]);
  expect(sessions).toBeInstanceOf(Array);
  expect(sessions.length).toBe(1);
  expect(sessions[0]).toBeInstanceOf(Session);
});

test('deserializes an SmsMessage object', () => {
  const client = deserialize(smsMessageJSON);
  expect(client).toBeInstanceOf(SMSMessage);
});

// TODO User deserialization
