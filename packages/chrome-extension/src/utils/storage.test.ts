import { ChromeStorageCache } from './storage';

type ChromeStorageGetPromise = (
  keys?: string | string[] | { [key: string]: any } | null,
) => Promise<{ [key: string]: any }>;

describe('ChromeStorageCache', () => {
  const KEY = 'foo';
  const VALUE = 'bar';

  const _void = void 0;
  const _chrome = globalThis.chrome;

  globalThis.chrome = {
    storage: {
      // @ts-expect-error - Mock
      local: {
        get: jest.fn(),
        remove: jest.fn(),
        set: jest.fn(),
      },
    },
  };

  afterEach(() => jest.resetAllMocks());

  afterAll(() => {
    jest.clearAllMocks();
    globalThis.chrome = _chrome;
  });

  describe('createKey', () => {
    test('returns a string key', () => {
      expect(ChromeStorageCache.createKey('a', 'b', 'c')).toBe('a|b|c');
    });

    test('omits falsy values', () => {
      // @ts-expect-error - Testing; Intentionally passing undefined value
      expect(ChromeStorageCache.createKey('a', undefined, false, null, 'c')).toBe('a|c');
    });
  });

  describe('set', () => {
    test('setting the storage cache', () => {
      const setMock = jest.mocked(globalThis.chrome.storage.local.set).mockImplementationOnce(() => void 0);

      expect(ChromeStorageCache.set(KEY, VALUE)).toBe(_void);
      expect(setMock).toHaveBeenCalledTimes(1);
      expect(setMock).toHaveBeenCalledWith({ [KEY]: VALUE });
    });
  });

  describe('remove', () => {
    test('removing from the storage cache', () => {
      const removeMock = jest.mocked(globalThis.chrome.storage.local.remove).mockImplementationOnce(() => void 0);

      expect(ChromeStorageCache.remove(KEY)).toBe(_void);
      expect(removeMock).toHaveBeenCalledTimes(1);
      expect(removeMock).toHaveBeenCalledWith(KEY);
    });
  });

  describe('get', () => {
    test('value missing', async () => {
      const getMock = jest.mocked<ChromeStorageGetPromise>(globalThis.chrome.storage.local.get).mockResolvedValue({});

      ChromeStorageCache.get(KEY);

      expect(await ChromeStorageCache.get(KEY)).toBeUndefined();
      expect(getMock).toHaveBeenCalledTimes(2); // Called Twice?!
      expect(getMock).toHaveBeenCalledWith(KEY);
    });

    test('value exists', async () => {
      const getMock = jest
        .mocked<ChromeStorageGetPromise>(globalThis.chrome.storage.local.get)
        .mockResolvedValue({ [KEY]: VALUE });

      expect(await ChromeStorageCache.get(KEY)).toBe(VALUE);
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(getMock).toHaveBeenCalledWith(KEY);
    });
  });
});
