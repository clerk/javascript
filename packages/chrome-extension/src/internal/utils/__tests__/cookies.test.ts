import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';
import browser from 'webextension-polyfill';

import { getClientCookie } from '../cookies';

type RequiredCookieOpts = 'domain' | 'name' | 'value';
type CreateCookieOpts<T extends keyof browser.Cookies.Cookie> = Pick<browser.Cookies.Cookie, T> &
  Partial<Omit<browser.Cookies.Cookie, T>>;

const createCookie = (opts: CreateCookieOpts<RequiredCookieOpts>): browser.Cookies.Cookie => ({
  firstPartyDomain: opts.domain,
  hostOnly: false,
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: true,
  session: false,
  storeId: '0',
  ...opts,
});

describe('Cookies', () => {
  const domain = 'clerk.domain.com';
  const urls = [`https://${domain}`, 'https://foo.com'];
  const name = '__client';
  const cookie = createCookie({ name, value: 'foo', domain });

  const getMock = vi.mocked(browser.cookies.get);

  afterEach(() => getMock.mockReset());
  afterAll(() => getMock.mockRestore());

  function expectMockCalls(mockedFn: typeof getMock, name: string, urls: string[]) {
    expect(mockedFn).toHaveBeenCalledTimes(urls.length);
    expect(mockedFn.mock.calls.flat()).toEqual(urls.map(url => ({ url, name })));
  }

  describe('getClientCookie', () => {
    test('returns cookie value from browser.cookies if is set for url', async () => {
      const url = urls[0];

      getMock.mockResolvedValue(cookie);

      expect(await getClientCookie({ callback: jest.fn(), name, url })).toBe(cookie);

      expectMockCalls(getMock, name, [url]);
    });
  });
});
