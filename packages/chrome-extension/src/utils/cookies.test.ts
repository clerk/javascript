import browser from 'webextension-polyfill';

import { getClientCookie } from './cookies';

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
  describe('getClientCookie', () => {
    const domain = 'clerk.domain.com';
    const url = `https://${domain}`;
    const name = '__client';
    const cookie = createCookie({ name, value: 'foo', domain });

    test('returns cookie value from browser.cookies if is set for url', async () => {
      const getMock = jest.mocked(browser.cookies.get).mockResolvedValue(cookie);

      expect(await getClientCookie(url, name)).toBe(cookie);

      expect(getMock).toHaveBeenCalledTimes(1);
      expect(getMock).toHaveBeenCalledWith({ url, name });
    });
  });
});
