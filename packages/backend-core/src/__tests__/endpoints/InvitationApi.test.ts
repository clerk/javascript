import nock from 'nock';

import { Invitation, InvitationJSON, ObjectType } from '../../api/resources';
import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';

afterEach(() => {
  nock.cleanAll();
});

test('getInvitationList() returns a list of invitations', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/invitations')
    .replyWithFile(200, __dirname + '/responses/getInvitationList.json', {});

  const invitationList = await TestClerkAPI.invitations.getInvitationList();
  expect(invitationList).toBeInstanceOf(Array);
  expect(invitationList.length).toEqual(1);
  expect(invitationList[0]).toBeInstanceOf(Invitation);
});

test('createInvitation() creates an invitation', async () => {
  const emailAddress = 'test@example.com';
  const resJSON: InvitationJSON = {
    object: ObjectType.Invitation,
    id: 'inv_randomid',
    email_address: emailAddress,
    created_at: 1611948436,
    updated_at: 1611948436,
    public_metadata: null,
  };

  nock(defaultServerAPIUrl)
    .post('/v1/invitations', {
      email_address: emailAddress,
    })
    .reply(200, resJSON);

  const invitation = await TestClerkAPI.invitations.createInvitation({
    emailAddress,
  });
  expect(invitation).toEqual(new Invitation(resJSON.id, emailAddress, null, resJSON.created_at, resJSON.updated_at));
});

test('createInvitation() accepts a redirectUrl', async () => {
  const emailAddress = 'test@example.com';
  const resJSON: InvitationJSON = {
    object: ObjectType.Invitation,
    id: 'inv_randomid',
    email_address: emailAddress,
    created_at: 1611948436,
    updated_at: 1611948436,
    public_metadata: null,
  };
  const redirectUrl = 'http://redirect.org';

  nock(defaultServerAPIUrl)
    .post('/v1/invitations', {
      email_address: emailAddress,
      redirect_url: redirectUrl,
    })
    .reply(200, resJSON);

  const invitation = await TestClerkAPI.invitations.createInvitation({
    emailAddress,
    redirectUrl,
  });
  expect(invitation).toEqual(new Invitation(resJSON.id, emailAddress, null, resJSON.created_at, resJSON.updated_at));
});

test('createInvitation() accepts publicMetadata', async () => {
  const emailAddress = 'test@example.com';
  const publicMetadata = {
    helloWorld: 42,
  };
  const resJSON = {
    object: 'invitation',
    id: 'inv_randomid',
    email_address: emailAddress,
    public_metadata: publicMetadata,
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock(defaultServerAPIUrl)
    .post('/v1/invitations', {
      email_address: emailAddress,
      public_metadata: publicMetadata,
    })
    .reply(200, resJSON);

  const invitation = await TestClerkAPI.invitations.createInvitation({
    emailAddress,
    publicMetadata,
  });
  expect(invitation).toEqual(
    new Invitation(resJSON.id, emailAddress, publicMetadata, resJSON.created_at, resJSON.updated_at),
  );
});

test('revokeInvitation() revokes an invitation', async () => {
  const id = 'inv_randomid';
  const resJSON: InvitationJSON = {
    object: ObjectType.Invitation,
    id,
    email_address: 'test@example.com',
    public_metadata: null,
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock(defaultServerAPIUrl).post(`/v1/invitations/${id}/revoke`).reply(200, resJSON);

  const invitation = await TestClerkAPI.invitations.revokeInvitation(id);
  expect(invitation).toEqual(new Invitation(id, resJSON.email_address, null, resJSON.created_at, resJSON.updated_at));
});

test('revokeInvitation() throws an error without invitation ID', async () => {
  await expect(TestClerkAPI.invitations.revokeInvitation('')).rejects.toThrow('A valid resource ID is required.');
});
