import nock from 'nock';
import snakecaseKeys from 'snakecase-keys';

import { User } from '../../api/resources';
import { TestBackendAPIClient } from '../TestBackendAPI';

test('getUserList() returns a list of users', async () => {
  nock('https://api.clerk.dev')
    .get(new RegExp(/v1\/users?\?/))
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const userList = await TestBackendAPIClient.users.getUserList();

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);

  // const expected = new User();

  // expect(userList[0]).toEqual(expected);

  expect(userList[0]).toBeInstanceOf(User);
});

test('getUserList() with limit returns a list of users', async () => {
  nock('https://api.clerk.dev')
    .get('/v1/users?limit=1')
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const userList = await TestBackendAPIClient.users.getUserList({ limit: 1 });

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);
  expect(userList[0]).toBeInstanceOf(User);
});

test('getUserList() with limit and offset returns a list of users', async () => {
  nock('https://api.clerk.dev')
    .get('/v1/users?limit=1&offset=1')
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const userList = await TestBackendAPIClient.users.getUserList({
    limit: 1,
    offset: 1,
  });

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);
  expect(userList[0]).toBeInstanceOf(User);
});

test('getUserList() with ordering returns a list of users', async () => {
  nock('https://api.clerk.dev')
    .get('/v1/users?order_by=%2Bupdated_at')
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const userList = await TestBackendAPIClient.users.getUserList({
    orderBy: '+updated_at',
  });

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);
  expect(userList[0]).toBeInstanceOf(User);
});

test('getUserList() with emails returns a list of users', async () => {
  nock('https://api.clerk.dev')
    .get('/v1/users?email_address=email1&email_address=email2')
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const userList = await TestBackendAPIClient.users.getUserList({
    emailAddress: ['email1', 'email2'],
  });

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);
  expect(userList[0]).toBeInstanceOf(User);
});

test('getUserList() with phone numbers returns a list of users', async () => {
  nock('https://api.clerk.dev')
    .get('/v1/users?phone_number=phone1&phone_number=phone2')
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const userList = await TestBackendAPIClient.users.getUserList({
    phoneNumber: ['phone1', 'phone2'],
  });

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);
  expect(userList[0]).toBeInstanceOf(User);
});

test('getUser() returns a single user', async () => {
  nock('https://api.clerk.dev')
    .get(`/v1/users/user_deadbeef`)
    .replyWithFile(200, __dirname + '/responses/getUser.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const user = await TestBackendAPIClient.users.getUser('user_deadbeef');

  expect(user).toBeInstanceOf(User);

  expect(user.externalAccounts.length).toEqual(2);
  expect(user.externalAccounts[0].provider).toEqual('google');
  expect(user.externalAccounts[1].provider).toEqual('facebook');

  expect(user.web3Wallets.length).toEqual(1);
  expect(user.web3Wallets[0].web3Wallet).toEqual(
    '0x0000000000000000000000000000000000000000'
  );
  expect(user.web3Wallets[0].verification).toMatchObject({
    attempts: 1,
    expireAt: expect.any(Number),
    nonce: 'l6i2keszfr0yftb0aghwxye8xdxmec2x4m86elc5',
  });

  const expectedPublicMetadata = { zodiac_sign: 'leo', ascendant: 'scorpio' };
  expect(user.publicMetadata).toEqual(expectedPublicMetadata);
});

test('getUser() throws an error without user ID', async () => {
  await expect(TestBackendAPIClient.users.getUser('')).rejects.toThrow(
    'A valid ID is required.'
  );
});

test('updateUser() throws an error without user ID', async () => {
  await expect(TestBackendAPIClient.users.updateUser('', {})).rejects.toThrow(
    'A valid ID is required.'
  );
});

test('deleteUser() throws an error without user ID', async () => {
  await expect(TestBackendAPIClient.users.deleteUser('')).rejects.toThrow(
    'A valid ID is required.'
  );
});

test('createUser() creates a user', async () => {
  const params = {
    emailAddress: ['boss@clerk.dev'],
    phoneNumber: ['+15555555555'],
    password: '123456',
    firstName: 'Boss',
    lastName: 'Clerk',
  };

  nock('https://api.clerk.dev')
    .post('/v1/users', snakecaseKeys(params))
    .replyWithFile(200, __dirname + '/responses/createUser.json', {
      'Content-Type': '',
    });

  const user = await TestBackendAPIClient.users.createUser(params);
  expect(user.firstName).toEqual('Boss');
});
