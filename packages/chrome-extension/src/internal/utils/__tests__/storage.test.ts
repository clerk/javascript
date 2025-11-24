import { afterEach, describe, expect, test, vi } from 'vitest';
import browser from 'webextension-polyfill';

import { BrowserStorageCache, MemoryStorageCache } from '../storage';

describe('StorageCache', () => {
  const KEY = 'foo';
  const VALUE = 'bar';

  const _void = void 0;

  describe('createKey', () => {
    test('returns a string key', () => {
      expect(BrowserStorageCache.createKey('a', 'b', 'c')).toBe('a|b|c');
    });

    test('omits falsy values', () => {
      // @ts-expect-error - Testing; Intentionally passing undefined value
      expect(BrowserStorageCache.createKey('a', undefined, false, null, 'c')).toBe('a|c');
    });
  });

  describe('set', () => {
    test('setting the storage cache', async () => {
      const setMock = vi.mocked(browser.storage.local.set).mockResolvedValueOnce(_void);

      expect(await BrowserStorageCache.set(KEY, VALUE)).toBe(_void);
      expect(setMock).toHaveBeenCalledTimes(1);
      expect(setMock).toHaveBeenCalledWith({ [KEY]: VALUE });
    });
  });

  describe('remove', () => {
    test('removing from the storage cache', async () => {
      const removeMock = vi.mocked(browser.storage.local.remove).mockResolvedValueOnce(_void);

      expect(await BrowserStorageCache.remove(KEY)).toBe(_void);
      expect(removeMock).toHaveBeenCalledTimes(1);
      expect(removeMock).toHaveBeenCalledWith(KEY);
    });
  });

  describe('get', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('value missing', async () => {
      const getMock = vi.mocked(browser.storage.local.get).mockResolvedValue({});

      expect(await BrowserStorageCache.get(KEY)).toBeUndefined();
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(getMock).toHaveBeenCalledWith(KEY);
    });

    test('value exists', async () => {
      const getMock = vi.mocked(browser.storage.local.get).mockResolvedValue({ [KEY]: VALUE });

      expect(await BrowserStorageCache.get(KEY)).toBe(VALUE);
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(getMock).toHaveBeenCalledWith(KEY);
    });
  });
});

describe('MemoryStorageCache', () => {
  const KEY = 'foo';
  const VALUE = 'bar';

  const _void = void 0;

  describe('createKey', () => {
    test('returns a string key', () => {
      expect(MemoryStorageCache.createKey('a', 'b', 'c')).toBe('a|b|c');
    });

    test('omits falsy values', () => {
      // @ts-expect-error - Testing; Intentionally passing undefined value
      expect(MemoryStorageCache.createKey('a', undefined, false, null, 'c')).toBe('a|c');
    });
  });

  describe('set', () => {
    test('setting the storage cache', async () => {
      await MemoryStorageCache.set(KEY, VALUE);
      expect(await MemoryStorageCache.get(KEY)).toBe(VALUE);
    });
  });

  describe('remove', () => {
    test('removing from the storage cache', async () => {
      expect(await MemoryStorageCache.set(KEY, VALUE)).toBe(_void);
      expect(await MemoryStorageCache.get(KEY)).toBe(VALUE);
      expect(await MemoryStorageCache.remove(KEY)).toBe(_void);
      expect(await MemoryStorageCache.get(KEY)).toBeUndefined();
    });
  });

  describe('get', () => {
    test('value missing', async () => {
      expect(await MemoryStorageCache.get(KEY)).toBeUndefined();
    });

    test('value exists', async () => {
      expect(await MemoryStorageCache.set(KEY, VALUE)).toBe(_void);
      expect(await MemoryStorageCache.get(KEY)).toBe(VALUE);
    });
  });
});
