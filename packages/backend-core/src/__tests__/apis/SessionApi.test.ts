import nock from 'nock';

import { Session } from '../../api/resources';
import { TestBackendAPIClient } from '../TestBackendAPI';

test('getSessionList() returns a list of sessions', async () => {
  nock('https://api.clerk.dev')
    .get('/v1/sessions')
    .replyWithFile(200, __dirname + '/responses/getSessionList.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const sessionList = await TestBackendAPIClient.sessions.getSessionList();

  expect(sessionList).toBeInstanceOf(Array);
  expect(sessionList.length).toEqual(2);

  const expected1 = new Session({
    id: 'sess_foobar',
    clientId: 'client_yolo',
    userId: 'user_babyyoda',
    status: 'expired',
    lastActiveAt: 1611595758,
    expireAt: 1612200558,
    abandonAt: 1614187758,
  });

  const expected2 = new Session({
    id: 'sess_snafu',
    clientId: 'client_fomo',
    userId: 'user_mandalorian',
    status: 'abandoned',
    lastActiveAt: 1611069720,
    expireAt: 1611311546,
    abandonAt: 1613298746,
  });

  expect(sessionList[0]).toEqual(expected1);
  expect(sessionList[1]).toEqual(expected2);
});

test('getSession() returns a single session', async () => {
  const expected = new Session({
    id: 'sess_oops',
    clientId: 'client_isalwayswrong',
    userId: 'user_player1',
    status: 'active',
    lastActiveAt: 1613593533,
    expireAt: 1614198333,
    abandonAt: 1616185533,
  });

  nock('https://api.clerk.dev')
    .get(`/v1/sessions/${expected.id}`)
    .replyWithFile(200, __dirname + '/responses/getSession.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const session = await TestBackendAPIClient.sessions.getSession(
    expected.id as string
  );

  expect(session).toEqual(expected);
});

test('getSession() throws an error without session ID', async () => {
  await expect(TestBackendAPIClient.sessions.getSession('')).rejects.toThrow(
    'A valid ID is required.'
  );
});

test('revokeSession() throws an error without session ID', async () => {
  await expect(TestBackendAPIClient.sessions.revokeSession('')).rejects.toThrow(
    'A valid ID is required.'
  );
});

test('verifySession() returns a session if verified', async () => {
  const expected = new Session({
    id: 'sess_oops',
    clientId: 'client_isalwayswrong',
    userId: 'user_player1',
    status: 'active',
    lastActiveAt: 1613593533,
    expireAt: 1614198333,
    abandonAt: 1616185533,
  });

  const sessionToken = 'random_jwt_token';

  nock('https://api.clerk.dev')
    .post(`/v1/sessions/${expected.id}/verify`, { token: sessionToken })
    .replyWithFile(200, __dirname + '/responses/getSession.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const session = await TestBackendAPIClient.sessions.verifySession(
    expected.id as string,
    sessionToken
  );

  expect(session).toEqual(expected);
});

test('verifySession() throws an error without session ID', async () => {
  await expect(
    TestBackendAPIClient.sessions.verifySession('', '')
  ).rejects.toThrow('A valid ID is required.');
});
