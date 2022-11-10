import nock from 'nock';
import snakecaseKeys from 'snakecase-keys';

import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';
import { DeletedObject, PhoneNumber, Verification } from '../../api/resources';

afterEach(() => {
  nock.cleanAll();
});

test('getPhoneNumber() returns a single phone number', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/phone_numbers/idn_avocado')
    .replyWithFile(200, __dirname + '/responses/getPhoneNumber.json', {
      'Content-Type': 'application/json',
    });

  const phoneNumber = await TestClerkAPI.phoneNumbers.getPhoneNumber('idn_avocado');

  console.log(phoneNumber);

  expect(phoneNumber).toBeInstanceOf(PhoneNumber);
  expect(phoneNumber.id).toEqual('idn_avocado');
  expect(phoneNumber.phoneNumber).toEqual('+15555555555');
  expect(phoneNumber.verification).toBeUndefined();
});

test('getPhoneNumber() throws an error if no id provided', async () => {
  await expect(TestClerkAPI.phoneNumbers.getPhoneNumber('')).rejects.toThrow('A valid resource ID is required.');
});

test('createPhoneNumber() creates a new phone number', async () => {
  const params = {
    userId: 'user_abcdefg',
    phoneNumber: '+15555555555',
    verified: false,
    primary: false,
  };

  nock(defaultServerAPIUrl)
    .post('/v1/phone_numbers', snakecaseKeys(params))
    .replyWithFile(200, __dirname + '/responses/getPhoneNumber.json', {
      'Content-Type': 'application/json',
    });

  const phoneNumber = await TestClerkAPI.phoneNumbers.createPhoneNumber(params);

  expect(phoneNumber).toBeInstanceOf(PhoneNumber);
  expect(phoneNumber.id).toEqual('idn_avocado');
  expect(phoneNumber.phoneNumber).toEqual('+15555555555');
  expect(phoneNumber.verification).toBeUndefined();
});

test('updatePhoneNumber() updates a single phone number', async () => {
  const params = {
    verified: true,
    primary: true,
  };

  nock(defaultServerAPIUrl)
    .patch('/v1/phone_numbers/idn_avocado', snakecaseKeys(params))
    .replyWithFile(200, __dirname + '/responses/updatePhoneNumber.json', {
      'Content-Type': 'application/json',
    });

  const phoneNumber = await TestClerkAPI.phoneNumbers.updatePhoneNumber('idn_avocado', params);

  expect(phoneNumber).toBeInstanceOf(PhoneNumber);
  expect(phoneNumber.id).toEqual('idn_avocado');
  expect(phoneNumber.phoneNumber).toEqual('+15555555555');
  expect(phoneNumber.verification).toBeInstanceOf(Verification);
});

test('updatePhoneNumber() throws an error if no id provided', async () => {
  await expect(TestClerkAPI.phoneNumbers.updatePhoneNumber('', {})).rejects.toThrow('A valid resource ID is required.');
});

test('deletePhoneNumber() deletes a single user', async () => {
  nock(defaultServerAPIUrl)
    .delete('/v1/phone_numbers/idn_avocado')
    .replyWithFile(200, __dirname + '/responses/deletePhoneNumber.json', {
      'Content-Type': 'application/json',
    });

  const deletedObject = await TestClerkAPI.phoneNumbers.deletePhoneNumber('idn_avocado');

  expect(deletedObject).toBeInstanceOf(DeletedObject);

  expect(deletedObject.object).toEqual('phone_number');
  expect(deletedObject.id).toEqual('idn_avocado');
  expect(deletedObject.deleted).toBeTruthy();
});

test('deletePhoneNumber() throws an error if no id provided', async () => {
  await expect(TestClerkAPI.phoneNumbers.deletePhoneNumber('')).rejects.toThrow('A valid resource ID is required.');
});
