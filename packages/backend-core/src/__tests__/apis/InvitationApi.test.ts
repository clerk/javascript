import nock from 'nock';

import { Invitation } from '../../api/resources';
import { TestBackendAPIClient } from '../TestBackendAPI';

test('getInvitationList() returns a list of invitations', async () => {
  nock('https://api.clerk.dev')
    .get('/v1/invitations')
    .replyWithFile(200, __dirname + '/responses/getInvitationList.json', {});

  const invitationList =
    await TestBackendAPIClient.invitations.getInvitationList();
  expect(invitationList).toBeInstanceOf(Array);
  expect(invitationList.length).toEqual(1);
  expect(invitationList[0]).toBeInstanceOf(Invitation);
});

test('createInvitation() creates an invitation', async () => {
  const emailAddress = 'test@example.com';
  const resJSON = {
    object: 'invitation',
    id: 'inv_randomid',
    email_address: emailAddress,
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock('https://api.clerk.dev')
    .post('/v1/invitations', {
      email_address: emailAddress,
    })
    .reply(200, resJSON);

  const invitation = await TestBackendAPIClient.invitations.createInvitation({
    emailAddress,
  });
  expect(invitation).toEqual(
    new Invitation({
      id: resJSON.id,
      emailAddress,
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    })
  );
});

test('createInvitation() accepts a redirectUrl', async () => {
  const emailAddress = 'test@example.com';
  const resJSON = {
    object: 'invitation',
    id: 'inv_randomid',
    email_address: emailAddress,
    created_at: 1611948436,
    updated_at: 1611948436,
  };
  const redirectUrl = 'http://redirect.org';

  nock('https://api.clerk.dev')
    .post('/v1/invitations', {
      email_address: emailAddress,
      redirect_url: redirectUrl,
    })
    .reply(200, resJSON);

  const invitation = await TestBackendAPIClient.invitations.createInvitation({
    emailAddress,
    redirectUrl,
  });
  expect(invitation).toEqual(
    new Invitation({
      id: resJSON.id,
      emailAddress,
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    })
  );
});

test('revokeInvitation() revokes an invitation', async () => {
  const id = 'inv_randomid';
  const resJSON = {
    object: 'invitation',
    id,
    email_address: 'test@example.com',
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock('https://api.clerk.dev')
    .post(`/v1/invitations/${id}/revoke`)
    .reply(200, resJSON);

  const invitation = await TestBackendAPIClient.invitations.revokeInvitation(
    id
  );
  expect(invitation).toEqual(
    new Invitation({
      id,
      emailAddress: resJSON.email_address,
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    })
  );
});

test('revokeInvitation() throws an error without invitation ID', async () => {
  await expect(
    TestBackendAPIClient.invitations.revokeInvitation('')
  ).rejects.toThrow('A valid ID is required.');
});
