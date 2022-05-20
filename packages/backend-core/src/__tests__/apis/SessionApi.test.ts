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

  const expected1 = new Session(
    'sess_foobar',
    'client_yolo',
    'user_babyyoda',
    'expired',
    1613593533,
    1613593533,
    1613593533,
    1613593533,
    1613593533,
  );

  const expected2 = new Session(
    'sess_snafu',
    'client_fomo',
    'user_mandalorian',
    'abandoned',
    1613593533,
    1613593533,
    1613593533,
    1613593533,
    1613593533,
  );

  expect(sessionList[0]).toEqual(expected1);
  expect(sessionList[1]).toEqual(expected2);
});

test('getSession() returns a single session', async () => {
  const expected = new Session(
    'sess_oops',
    'client_isalwayswrong',
    'user_player1',
    'active',
    1613593533,
    1613593533,
    1613593533,
    1613593533,
    1613593533,
  );

  nock('https://api.clerk.dev')
    .get(`/v1/sessions/${expected.id}`)
    .replyWithFile(200, __dirname + '/responses/getSession.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const session = await TestBackendAPIClient.sessions.getSession(expected.id);

  expect(session).toEqual(expected);
});

test('getSession() throws an error without session ID', async () => {
  await expect(TestBackendAPIClient.sessions.getSession('')).rejects.toThrow('A valid ID is required.');
});

test('revokeSession() throws an error without session ID', async () => {
  await expect(TestBackendAPIClient.sessions.revokeSession('')).rejects.toThrow('A valid ID is required.');
});

test('verifySession() returns a session if verified', async () => {
  const expected = new Session(
    'sess_oops',
    'client_isalwayswrong',
    'user_player1',
    'active',
    1613593533,
    1613593533,
    1613593533,
    1613593533,
    1613593533,
  );

  const sessionToken = 'random_jwt_token';

  nock('https://api.clerk.dev')
    .post(`/v1/sessions/${expected.id}/verify`, { token: sessionToken })
    .replyWithFile(200, __dirname + '/responses/getSession.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const session = await TestBackendAPIClient.sessions.verifySession(expected.id, sessionToken);

  expect(session).toEqual(expected);
});

test('verifySession() throws an error without session ID', async () => {
  await expect(TestBackendAPIClient.sessions.verifySession('', '')).rejects.toThrow('A valid ID is required.');
});
