import nock from 'nock';

import { SignInToken } from '../../api/resources';
import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';

const resJSON = {
  object: 'sign_in_token',
  id: 'sit_26Ed5ZqqJcOjRwecRQij2ZovDdG',
  user_id: 'user_26Ect5GuCCeaFWwSDiiKcgAGtVk',
  token:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJFeHBpcmVzSW5TZWNvbmRzIjo1LCJleHAiOjE2NDY5OTI1MDEsImlpZCI6Imluc18yNkVja3R0TnJDamE3YTZQT0xINTVDQVBpZmQiLCJzaWQiOiJzaXRfMjZFZDVacXFKY09qUndlY1JRaWoyWm92RGRHIiwic3QiOiJzaWduX2luX3Rva2VuIn0.j6Gwl6g2QcAJ9AjRvG1k7aUrnMCyPU49hYgTlmDG9gD_8Yd7sxUepyDdCHRaDaABlWg-G3tUs09HRfdrAXM-4e6NwcEy_ak1LWkE3G6WVhPnlomwH7n7BsIbmoybf91Eel0XRlb33XdUVaWNaA_CH8INkVLtXfZWTorNsAN2-Es_6G-Jtz4Zvw8hZBtXQDMSlyl27rxohMvfefv-ffG6Kd0XsvT9yYj2kik5KcONMWO6XEPtMZRoHzMabnmPQbLrUPBmbnU_1UVFpxL0LfuOXlxbV3LIvuejmhNZZtR0ZwcbrAnXruof4KjmCK_QOpqShI3dTlyYTV18amy2se5oxA',
  status: 'pending',
  created_at: 1638000669544,
  updated_at: 1638000669544,
};

afterEach(() => {
  nock.cleanAll();
});

test('createSignInToken() creates a new sign in token', async () => {
  nock(defaultServerAPIUrl).post('/v1/sign_in_tokens').reply(200, resJSON);

  const signInToken = await TestClerkAPI.signInTokens.createSignInToken({
    userId: resJSON.user_id,
    expiresInSeconds: 60,
  });
  expect(signInToken).toBeInstanceOf(SignInToken);
  expect(signInToken.userId).toBe(resJSON.user_id);
});

test('revokeSignInToken() revokes a sign in token', async () => {
  nock(defaultServerAPIUrl).post(`/v1/sign_in_tokens/${resJSON.id}/revoke`).reply(200, resJSON);
  await TestClerkAPI.signInTokens.revokeSignInToken(resJSON.id);
});

test('revokeSignInToken() throws an error without sign in tokens url ID', async () => {
  await expect(TestClerkAPI.signInTokens.revokeSignInToken('')).rejects.toThrow('A valid resource ID is required.');
});
