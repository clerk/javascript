import { getClientCookie } from './cookies';

const domain = 'clerk.domain.com';
const createCookie = (
  name: string,
  value: string,
  opts: Partial<Omit<chrome.cookies.Cookie, 'name' | 'value'>>,
): chrome.cookies.Cookie => ({
  domain: 'clerk.domain.com',
  secure: true,
  httpOnly: true,
  path: '/',
  storeId: '0',
  session: false,
  hostOnly: false,
  sameSite: 'no_restriction',
  ...opts,
  name,
  value,
});

describe('utils', () => {
  const _chrome = globalThis.chrome;

  // export function get(details: Details): Promise<Cookie | null>;

  globalThis.chrome = {
    // @ts-expect-error - Mock
    cookies: {
      get: jest.fn(),
      // get: jest.fn(({ url, name }) => `cookies.get:${url}:${name}`),
    },
  };

  afterEach(() => jest.resetAllMocks());
  afterAll(() => {
    jest.clearAllMocks();
    globalThis.chrome = _chrome;
  });

  // export function get(details: Details): Promise<Cookie | null>;
  describe('getClientCookie', () => {
    const url = `https://${domain}`;
    const name = '__client';
    const cookie = createCookie(name, 'foo', { domain });

    test('returns cookie value from chrome.cookies if is set for url', async () => {
      const getMock = jest.mocked(globalThis.chrome.cookies.get).mockResolvedValue(cookie);

      expect(await getClientCookie(url)).toBe(cookie);

      expect(getMock).toHaveBeenCalledTimes(1);
      expect(getMock).toHaveBeenCalledWith({ url, name });
    });
  });
});
