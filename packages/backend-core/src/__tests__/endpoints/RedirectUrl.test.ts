import nock from 'nock';

import { RedirectUrl } from '../../api/resources';
import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';

const resJSON = {
  object: 'redirect_url',
  id: 'ru_28eW1GeqywLZSzoBoaHJ79pkPR6',
  url: 'my-app://oauth-callback',
  created_at: 1651577314987,
  updated_at: 1651577314987,
};

afterEach(() => {
  nock.cleanAll();
});

test('getRedirectUrlList() returns a list of redirect urls', async () => {
  nock(defaultServerAPIUrl).get('/v1/redirect_urls').reply(200, [resJSON]);

  const redirectUrlsList = await TestClerkAPI.redirectUrls.getRedirectUrlList();
  expect(redirectUrlsList).toBeInstanceOf(Array);
  expect(redirectUrlsList.length).toEqual(1);
  expect(redirectUrlsList[0]).toBeInstanceOf(RedirectUrl);
});

test('getRedirectUrl() returns a redirect url', async () => {
  nock(defaultServerAPIUrl).get(`/v1/redirect_urls/${resJSON.id}`).reply(200, resJSON);

  const redirectUrl = await TestClerkAPI.redirectUrls.getRedirectUrl(resJSON.id);
  expect(redirectUrl).toBeInstanceOf(RedirectUrl);
  expect(redirectUrl.url).toBe(resJSON.url);
});

test('getRedirectUrl() throws an error without redirect url ID', async () => {
  await expect(TestClerkAPI.redirectUrls.getRedirectUrl('')).rejects.toThrow('A valid resource ID is required.');
});

test('createRedirectUrl() creates a new redirect url', async () => {
  nock(defaultServerAPIUrl)
    .post(
      '/v1/redirect_urls',
      JSON.stringify({
        url: resJSON.url,
      }),
    )
    .reply(200, resJSON);

  const redirectUrl = await TestClerkAPI.redirectUrls.createRedirectUrl({
    url: resJSON.url,
  });
  expect(redirectUrl).toEqual(new RedirectUrl(resJSON.id, resJSON.url, resJSON.created_at, resJSON.updated_at));
});

test('deleteRedirectUrl() deletes an redirect url', async () => {
  nock(defaultServerAPIUrl).delete(`/v1/redirect_urls/${resJSON.id}`).reply(200, {});
  await TestClerkAPI.redirectUrls.deleteRedirectUrl(resJSON.id);
});

test('deleteRedirectUrl() throws an error without redirect url ID', async () => {
  await expect(TestClerkAPI.redirectUrls.deleteRedirectUrl('')).rejects.toThrow('A valid resource ID is required.');
});
