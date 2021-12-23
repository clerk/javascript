import Clerk from '../Clerk';
import { AllowlistIdentifierApi } from '../apis/AllowlistIdentifierApi';
import { ClientApi } from '../apis/ClientApi';
import { EmailApi } from '../apis/EmailApi';
import { InvitationApi } from '../apis/InvitationApi';
import { SessionApi } from '../apis/SessionApi';
import { SMSMessageApi } from '../apis/SMSMessageApi';
import { UserApi } from '../apis/UserApi';

test('getInstance() getter returns a Clerk instance', () => {
  const clerk = Clerk.getInstance();
  expect(clerk).toBeInstanceOf(Clerk);
});

test('getInstance() always returns the same instance', () => {
  const clerk = Clerk.getInstance();
  const clerk2 = Clerk.getInstance();
  expect(clerk2).toBe(clerk);
});

test('separate Clerk instances are not the same object', () => {
  const clerk = new Clerk();
  const clerk2 = new Clerk();
  expect(clerk2).not.toBe(clerk);
});

test('allowlistIdentifiers getter returns an AllowlistIdentifier API instance', () => {
  const allowlistIdentifiers = Clerk.getInstance().allowlistIdentifiers;
  expect(allowlistIdentifiers).toBeInstanceOf(AllowlistIdentifierApi);
});

test('allowlistIdentifiers getter returns the same instance every time', () => {
  const allowlistIdentifiers = Clerk.getInstance().allowlistIdentifiers;
  const allowlistIdentifiers2 = Clerk.getInstance().allowlistIdentifiers;
  expect(allowlistIdentifiers2).toBe(allowlistIdentifiers);
});

test('clients getter returns a Client API instance', () => {
  const clients = Clerk.getInstance().clients;
  expect(clients).toBeInstanceOf(ClientApi);
});

test('clients getter returns the same instance every time', () => {
  const clients = Clerk.getInstance().clients;
  const clients2 = Clerk.getInstance().clients;
  expect(clients2).toBe(clients);
});

test('emails getter returns a Email API instance', () => {
  const emails = Clerk.getInstance().emails;
  expect(emails).toBeInstanceOf(EmailApi);
});

test('emails getter returns the same instance every time', () => {
  const emails = Clerk.getInstance().emails;
  const emails2 = Clerk.getInstance().emails;
  expect(emails2).toBe(emails);
});

test('invitations getter returns an Invation API instance', () => {
  const invitations = Clerk.getInstance().invitations;
  expect(invitations).toBeInstanceOf(InvitationApi);
});

test('invitations getter returns the same instance every time', () => {
  const invitations = Clerk.getInstance().invitations;
  const invitations2 = Clerk.getInstance().invitations;
  expect(invitations2).toBe(invitations);
});

test('sessions getter returns a Session API instance', () => {
  const sessions = Clerk.getInstance().sessions;
  expect(sessions).toBeInstanceOf(SessionApi);
});

test('sessions getter returns the same instance every time', () => {
  const sessions = Clerk.getInstance().sessions;
  const sessions2 = Clerk.getInstance().sessions;
  expect(sessions2).toBe(sessions);
});

test('smsMessages getter returns an smsMessage API instance', () => {
  const smsMessages = Clerk.getInstance().smsMessages;
  expect(smsMessages).toBeInstanceOf(SMSMessageApi);
});

test('smsMessages getter returns the same instance every time', () => {
  const smsMessages = Clerk.getInstance().smsMessages;
  const smsMessages2 = Clerk.getInstance().smsMessages;
  expect(smsMessages2).toBe(smsMessages);
});

test('users getter returns a User api instance', () => {
  const users = Clerk.getInstance().users;
  expect(users).toBeInstanceOf(UserApi);
});

test('users getter returns the same instance every time', () => {
  const users = Clerk.getInstance().users;
  const users2 = Clerk.getInstance().users;
  expect(users2).toBe(users);
});
