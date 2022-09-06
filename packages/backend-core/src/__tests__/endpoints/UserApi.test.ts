import nock from 'nock';
import snakecaseKeys from 'snakecase-keys';

import { User } from '../../api/resources';
import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';

afterEach(() => {
  nock.cleanAll();
});

test('getUserList() returns a list of users', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/users')
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/json',
    });

  const userList = await TestClerkAPI.users.getUserList();

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);
  expect(userList[0]).toBeInstanceOf(User);
});

test('getUserList() with limit returns a list of users', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/users?limit=1')
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/json',
    });

  const userList = await TestClerkAPI.users.getUserList({ limit: 1 });

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);
  expect(userList[0]).toBeInstanceOf(User);
});

test('getUserList() with limit and offset returns a list of users', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/users?limit=1&offset=1')
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/json',
    });

  const userList = await TestClerkAPI.users.getUserList({
    limit: 1,
    offset: 1,
  });

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);
  expect(userList[0]).toBeInstanceOf(User);
});

test('getUserList() with ordering returns a list of users', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/users?order_by=%2Bupdated_at')
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/json',
    });

  const userList = await TestClerkAPI.users.getUserList({
    orderBy: '+updated_at',
  });

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);
  expect(userList[0]).toBeInstanceOf(User);
});

test('getUserList() with emails returns a list of users', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/users?email_address=email1&email_address=email2')
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/json',
    });

  const userList = await TestClerkAPI.users.getUserList({
    emailAddress: ['email1', 'email2'],
  });

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);
  expect(userList[0]).toBeInstanceOf(User);
});

test('getUserList() with phone numbers returns a list of users', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/users?phone_number=phone1&phone_number=phone2')
    .replyWithFile(200, __dirname + '/responses/getUserList.json', {
      'Content-Type': 'application/json',
    });

  const userList = await TestClerkAPI.users.getUserList({
    phoneNumber: ['phone1', 'phone2'],
  });

  expect(userList).toBeInstanceOf(Array);
  expect(userList.length).toEqual(1);
  expect(userList[0]).toBeInstanceOf(User);
});

test('getUser() returns a single user', async () => {
  nock(defaultServerAPIUrl)
    .get(`/v1/users/user_deadbeef`)
    .replyWithFile(200, __dirname + '/responses/getUser.json', {
      'Content-Type': 'application/json',
    });

  const user = await TestClerkAPI.users.getUser('user_deadbeef');

  expect(user).toBeInstanceOf(User);

  expect(user.externalAccounts.length).toEqual(2);
  expect(user.externalAccounts[0].provider).toEqual('google');
  expect(user.externalAccounts[0].username).toEqual('tester');
  expect(user.externalAccounts[0].publicMetadata).toBeInstanceOf(Object);
  expect(user.externalAccounts[0].label).toBeNull();
  expect(user.externalAccounts[1].provider).toEqual('facebook');
  expect(user.externalAccounts[1].username).toBeNull();
  expect(user.externalAccounts[1].publicMetadata).toMatchObject({ extra: 'more info' });
  expect(user.externalAccounts[1].label).toEqual('clerk');

  expect(user.web3Wallets.length).toEqual(1);
  expect(user.web3Wallets[0].web3Wallet).toEqual('0x0000000000000000000000000000000000000000');
  expect(user.web3Wallets[0].verification).toMatchObject({
    attempts: 1,
    expireAt: expect.any(Number),
    nonce: 'l6i2keszfr0yftb0aghwxye8xdxmec2x4m86elc5',
  });

  const expectedPublicMetadata = { zodiac_sign: 'leo', ascendant: 'scorpio' };
  expect(user.publicMetadata).toEqual(expectedPublicMetadata);
});

test('getUser() throws an error without user ID', async () => {
  await expect(TestClerkAPI.users.getUser('')).rejects.toThrow('A valid resource ID is required.');
});

test('createUser() creates a user', async () => {
  const params = {
    emailAddress: ['boss@clerk.dev'],
    phoneNumber: ['+15555555555'],
    password: '123456',
    firstName: 'Boss',
    lastName: 'Clerk',
    totpSecret: 'AICJ3HCXKO4KOY6NDH6RII4E3ZYL5ZBH',
  };

  nock(defaultServerAPIUrl)
    .post('/v1/users', snakecaseKeys(params))
    .replyWithFile(200, __dirname + '/responses/createUser.json', {
      'Content-Type': '',
    });

  const user = await TestClerkAPI.users.createUser(params);
  expect(user.firstName).toEqual('Boss');
});

test('updateUser() updates a user', async () => {
  const params = {
    emailAddress: ['boss@clerk.dev'],
    firstName: 'Boss',
    publicMetadata: {
      topKey: {
        nestedKey: 42,
      },
    },
  };

  nock(defaultServerAPIUrl)
    .patch('/v1/users/user_1oBNj55jOjSK9rOYrT5QHqj7eaK', {
      email_address: ['boss@clerk.dev'],
      first_name: 'Boss',
      // The SDK converts only top level keys to snakecase. Nested objects such as metadata are kept with their original key & values.
      public_metadata: {
        topKey: {
          nestedKey: 42,
        },
      },
    })
    .replyWithFile(200, __dirname + '/responses/updateUser.json', {
      'Content-Type': '',
    });

  const user = await TestClerkAPI.users.updateUser('user_1oBNj55jOjSK9rOYrT5QHqj7eaK', params);
  expect(user.firstName).toEqual('Boss');
  expect(user.username).toEqual('clerk_boss');
});

test('updateUser() throws an error without user ID', async () => {
  await expect(TestClerkAPI.users.updateUser('', {})).rejects.toThrow('A valid resource ID is required.');
});

test('deleteUser() throws an error without user ID', async () => {
  await expect(TestClerkAPI.users.deleteUser('')).rejects.toThrow('A valid resource ID is required.');
});

test('getCount() returns a valid number response', async () => {
  nock(defaultServerAPIUrl)
    .get(`/v1/users/count?`)
    .replyWithFile(200, __dirname + '/responses/getCount.json');

  const userCount = await TestClerkAPI.users.getCount();
  expect(userCount).toEqual(1);
});

test('disableUserMFA() throws an error without user ID', async () => {
  await expect(TestClerkAPI.users.disableUserMFA('')).rejects.toThrow('A valid resource ID is required.');
});

test('disableUserMFA() disables all MFA methods of a user', async () => {
  const id = 'user_1oBNj55jOjSK9rOYrT5QHqj7eaK';

  nock(defaultServerAPIUrl).delete(`/v1/users/${id}/mfa`).reply(200, { user_id: 'user_1oBNj55jOjSK9rOYrT5QHqj7eaK' });

  await TestClerkAPI.users.disableUserMFA(id);
});
