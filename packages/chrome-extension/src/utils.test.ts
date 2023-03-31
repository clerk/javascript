import { convertPublishableKeyToFrontendAPIOrigin, getClientCookie, setInStorage, getFromStorage } from './utils';

describe('utils', () => {
  const _chrome = globalThis.chrome;

  beforeAll(() => {
    globalThis.chrome = {
      storage: {
        // @ts-ignore
        local: { set: jest.fn(), get: jest.fn(k => Promise.resolve({ [k]: `storage.get:${k}` })) },
      },
      // @ts-ignore
      cookies: { get: jest.fn(({ url, name }) => `cookies.get:${url}:${name}`) },
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    globalThis.chrome = _chrome;
  });

  describe('convertPublishableKeyToFrontendAPIOrigin(key)', () => {
    test('returns FAPI domain for production', () => {
      const livePk = 'pk_live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk';

      expect(convertPublishableKeyToFrontendAPIOrigin(livePk)).toEqual('https://example.clerk.accounts.dev');
    });

    test('returns FAPI domain for development', () => {
      const devPk = 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk';

      expect(convertPublishableKeyToFrontendAPIOrigin(devPk)).toEqual('https://example.clerk.accounts.dev');
    });

    test('returns FAPI domain for invalid key', () => {
      const invalidPk = 'pk_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk';

      const errMsg = 'The string to be decoded contains invalid characters.';
      expect(() => convertPublishableKeyToFrontendAPIOrigin(invalidPk)).toThrowError(errMsg);
    });
  });

  describe('getClientCookie(url)', () => {
    test('returns cookie value from chrome.cookies if is set for url', async () => {
      const url = 'http://localhost:3000';
      await expect(getClientCookie(url)).resolves.toEqual(`cookies.get:${url}:__client`);
    });
  });

  describe('setInStorage(key, value)', () => {
    test('sets value in chrome.storage', () => {
      setInStorage('key', 'value');

      expect(globalThis.chrome.storage.local.set).toBeCalledTimes(1);
      expect(globalThis.chrome.storage.local.set).toBeCalledWith({ key: 'value' });
    });
  });

  describe('getFromStorage(key)', () => {
    test('gets value from chrome.storage', async () => {
      await expect(getFromStorage('key')).resolves.toEqual(`storage.get:key`);
    });
  });
});
