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
  const domain = 'clerk.domain.com';
  const urls = [`https://${domain}`, 'https://foo.com'];
  const name = '__client';
  const cookie = createCookie({ name, value: 'foo', domain });

  const getMock = jest.mocked(browser.cookies.get);

  afterEach(() => getMock.mockReset());
  afterAll(() => getMock.mockRestore());

  function expectMockCalls(mockedFn: typeof getMock, name: string, urls: string[]) {
    expect(mockedFn).toHaveBeenCalledTimes(urls.length);
    expect(mockedFn.mock.calls.flat()).toEqual(urls.map(url => ({ url, name })));
  }

  describe('getClientCookie', () => {
    describe('Single Host', () => {
      test('returns cookie value from browser.cookies if is set for url', async () => {
        const url = urls[0];

        getMock.mockResolvedValue(cookie);

        expect(await getClientCookie({ urls: url, name })).toBe(cookie);

        expectMockCalls(getMock, name, [url]);
      });
    });

    describe('Multiple Hosts', () => {
      test('with valid urls', async () => {
        getMock.mockResolvedValueOnce(cookie).mockResolvedValueOnce(null).mockResolvedValueOnce(null);

        expect(await getClientCookie({ urls, name })).toBe(cookie);

        expectMockCalls(getMock, name, urls);
      });

      test('with invalid urls', async () => {
        const urls = ['foo'];

        getMock.mockResolvedValue(null);
        expect(await getClientCookie({ urls, name })).toBe(null);

        expectMockCalls(getMock, name, urls);
      });

      test('with single result', async () => {
        getMock.mockResolvedValueOnce(cookie).mockResolvedValueOnce(null);

        expect(await getClientCookie({ urls, name })).toBe(cookie);

        expectMockCalls(getMock, name, urls);
      });

      test('with multiple results - should pick first result', async () => {
        const cookie2 = createCookie({ name, value: 'result2', domain });

        getMock.mockResolvedValueOnce(cookie).mockResolvedValueOnce(cookie2);

        expect(await getClientCookie({ urls, name })).toBe(cookie);

        expectMockCalls(getMock, name, urls);
      });

      test('with rejected result', async () => {
        const urls = [`https://${domain}`, 'https://foo.com'];

        getMock.mockResolvedValueOnce(cookie).mockRejectedValueOnce(null);

        expect(await getClientCookie({ urls, name })).toBe(cookie);

        expectMockCalls(getMock, name, urls);
      });

      test('with empty result', async () => {
        getMock.mockResolvedValueOnce(null).mockRejectedValueOnce(null);

        expect(await getClientCookie({ urls, name })).toBe(null);

        expectMockCalls(getMock, name, urls);
      });
    });
  });
});
