import nock from 'nock';

import { Client } from '../../api/resources';
import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';

afterEach(() => {
  nock.cleanAll();
});

test('getClientList() returns a list of clients', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/clients')
    .replyWithFile(200, __dirname + '/responses/getClientList.json', {
      'Content-Type': 'application/json',
    });

  const clientList = await TestClerkAPI.clients.getClientList();

  expect(clientList).toBeInstanceOf(Array);
  expect(clientList.length).toEqual(2);

  const expected1 = new Client(
    'client_isalwaysright',
    ['sess_swag'],
    [
      {
        id: 'sess_swag',
        clientId: 'client_isalwaysright',
        userId: 'user_player1',
        status: 'active',
        lastActiveAt: 1630846634,
        expireAt: 1630846634,
        abandonAt: 1630846634,
        createdAt: 1630846634,
        updatedAt: 1630846634,
      },
    ],
    null,
    null,
    null,
    null,
    'sess_swag',
    1630846634,
    1630846634,
  );

  const expected2 = new Client(
    'client_keysersoze',
    ['sess_mood'],
    [
      {
        id: 'sess_mood',
        clientId: 'client_keysersoze',
        userId: 'user_player2',
        status: 'active',
        lastActiveAt: 1630846634,
        expireAt: 1630846634,
        abandonAt: 1630846634,
        createdAt: 1630846634,
        updatedAt: 1630846634,
      },
    ],
    'sia_qwerty',
    null,
    null,
    null,
    null,
    1630846634,
    1630846634,
  );

  expect(clientList[0]).toEqual(expected1);
  expect(clientList[1]).toEqual(expected2);
});

test('getClient() returns a single client', async () => {
  const expected = new Client(
    'client_server',
    ['sess_onthebeach'],
    [
      {
        id: 'sess_onthebeach',
        clientId: 'client_server',
        userId: 'user_player1',
        status: 'active',
        lastActiveAt: 1630846634,
        expireAt: 1630846634,
        abandonAt: 1630846634,
        createdAt: 1630846634,
        updatedAt: 1630846634,
      },
    ],
    'sia_cheepthrills',
    null,
    null,
    null,
    null,
    1630846634,
    1630846634,
  );

  nock(defaultServerAPIUrl)
    .get(`/v1/clients/${expected.id}`)
    .replyWithFile(200, __dirname + '/responses/getClient.json', {
      'Content-Type': 'application/json',
    });

  const client = await TestClerkAPI.clients.getClient(expected.id);

  expect(client).toEqual(expected);
});

test('getClient() throws an error without client ID', async () => {
  await expect(TestClerkAPI.clients.getClient('')).rejects.toThrow('A valid resource ID is required.');
});

test('verifyClient() returns a client if verified', async () => {
  const expected = new Client(
    'client_server',
    ['sess_onthebeach'],
    [
      {
        id: 'sess_onthebeach',
        clientId: 'client_server',
        userId: 'user_player1',
        status: 'active',
        lastActiveAt: 1630846634,
        expireAt: 1630846634,
        abandonAt: 1630846634,
        createdAt: 1630846634,
        updatedAt: 1630846634,
      },
    ],
    'sia_cheepthrills',
    null,
    null,
    null,
    null,
    1630846634,
    1630846634,
  );

  const sessionToken = 'random_jwt_token';

  nock(defaultServerAPIUrl)
    .post(`/v1/clients/verify`, { token: sessionToken })
    .replyWithFile(200, __dirname + '/responses/getClient.json', {
      'Content-Type': 'application/json',
    });

  const client = await TestClerkAPI.clients.verifyClient(sessionToken);

  expect(client).toEqual(expected);
});
