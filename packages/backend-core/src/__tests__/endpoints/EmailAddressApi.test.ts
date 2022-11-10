import nock from 'nock';
import snakecaseKeys from 'snakecase-keys';

import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';
import { DeletedObject, EmailAddress, Verification } from '../../api/resources';

afterEach(() => {
  nock.cleanAll();
});

test('getEmailAddress() returns a single email address', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/email_addresses/idn_banana')
    .replyWithFile(200, __dirname + '/responses/getEmailAddress.json', {
      'Content-Type': 'application/json',
    });

  const emailAddress = await TestClerkAPI.emailAddresses.getEmailAddress('idn_banana');

  expect(emailAddress).toBeInstanceOf(EmailAddress);
  expect(emailAddress.id).toEqual('idn_banana');
  expect(emailAddress.emailAddress).toEqual('banana@cherry.com');
  expect(emailAddress.verification).toBeUndefined();
});

test('getEmailAddress() throws an error if no id provided', async () => {
  await expect(TestClerkAPI.emailAddresses.getEmailAddress('')).rejects.toThrow('A valid resource ID is required.');
});

test('createEmailAddress() creates a new email address', async () => {
  const params = {
    userId: 'user_abcdefg',
    emailAddress: 'banana@cherry.com',
    verified: false,
    primary: false,
  };

  nock(defaultServerAPIUrl)
    .post('/v1/email_addresses', snakecaseKeys(params))
    .replyWithFile(200, __dirname + '/responses/getEmailAddress.json', {
      'Content-Type': 'application/json',
    });

  const emailAddress = await TestClerkAPI.emailAddresses.createEmailAddress(params);

  expect(emailAddress).toBeInstanceOf(EmailAddress);
  expect(emailAddress.id).toEqual('idn_banana');
  expect(emailAddress.emailAddress).toEqual('banana@cherry.com');
  expect(emailAddress.verification).toBeUndefined();
});

test('updateEmailAddress() updates a single email address', async () => {
  const params = {
    verified: true,
    primary: true,
  };

  nock(defaultServerAPIUrl)
    .patch('/v1/email_addresses/idn_banana', snakecaseKeys(params))
    .replyWithFile(200, __dirname + '/responses/updateEmailAddress.json', {
      'Content-Type': 'application/json',
    });

  const emailAddress = await TestClerkAPI.emailAddresses.updateEmailAddress('idn_banana', params);

  expect(emailAddress).toBeInstanceOf(EmailAddress);
  expect(emailAddress.id).toEqual('idn_banana');
  expect(emailAddress.emailAddress).toEqual('banana@cherry.com');
  expect(emailAddress.verification).toBeInstanceOf(Verification);
});

test('updateEmailAddress() throws an error if no id provided', async () => {
  await expect(TestClerkAPI.emailAddresses.updateEmailAddress('', {})).rejects.toThrow(
    'A valid resource ID is required.',
  );
});

test('deleteEmailAddress() deletes a single user', async () => {
  nock(defaultServerAPIUrl)
    .delete('/v1/email_addresses/idn_banana')
    .replyWithFile(200, __dirname + '/responses/deleteEmailAddress.json', {
      'Content-Type': 'application/json',
    });

  const deletedObject = await TestClerkAPI.emailAddresses.deleteEmailAddress('idn_banana');

  expect(deletedObject).toBeInstanceOf(DeletedObject);

  expect(deletedObject.object).toEqual('email_address');
  expect(deletedObject.id).toEqual('idn_banana');
  expect(deletedObject.deleted).toBeTruthy();
});

test('deleteEmailAddress() throws an error if no id provided', async () => {
  await expect(TestClerkAPI.emailAddresses.deleteEmailAddress('')).rejects.toThrow('A valid resource ID is required.');
});
