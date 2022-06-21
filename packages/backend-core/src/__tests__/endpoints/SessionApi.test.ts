import nock from 'nock';

import { Session } from '../../api/resources';
import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';

afterEach(() => {
  nock.cleanAll();
});

test('getSessionList() returns a list of sessions', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/sessions')
    .replyWithFile(200, __dirname + '/responses/getSessionList.json', {
      'Content-Type': 'application/json',
    });

  const sessionList = await TestClerkAPI.sessions.getSessionList();

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

  nock(defaultServerAPIUrl)
    .get(`/v1/sessions/${expected.id}`)
    .replyWithFile(200, __dirname + '/responses/getSession.json', {
      'Content-Type': 'application/json',
    });

  const session = await TestClerkAPI.sessions.getSession(expected.id);

  expect(session).toEqual(expected);
});

test('getSession() throws an error without session ID', async () => {
  await expect(TestClerkAPI.sessions.getSession('')).rejects.toThrow('A valid resource ID is required.');
});

test('revokeSession() throws an error without session ID', async () => {
  await expect(TestClerkAPI.sessions.revokeSession('')).rejects.toThrow('A valid resource ID is required.');
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

  nock(defaultServerAPIUrl)
    .post(`/v1/sessions/${expected.id}/verify`, { token: sessionToken })
    .replyWithFile(200, __dirname + '/responses/getSession.json', {
      'Content-Type': 'application/json',
    });

  const session = await TestClerkAPI.sessions.verifySession(expected.id, sessionToken);

  expect(session).toEqual(expected);
});

test('verifySession() throws an error without session ID', async () => {
  await expect(TestClerkAPI.sessions.verifySession('', '')).rejects.toThrow('A valid resource ID is required.');
});
