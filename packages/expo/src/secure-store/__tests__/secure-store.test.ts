import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createSecureStore } from '../secure-store';
import { DUMMY_TEST_LARGE_JSON } from './dummy-test-data';

const KEY = 'key';

const splitIntoChunks = (value: string): string[] => {
  // Array.from is used to handle unicode characters correctly
  const characters = Array.from(value);

  const chunks: string[] = [];
  for (let i = 0; i < characters.length; i += 1024) {
    chunks.push(characters.slice(i, i + 1024).join(''));
  }
  return chunks;
};

const mocks = vi.hoisted(() => {
  return {
    setItemAsync: vi.fn(),
    getItemAsync: vi.fn(),
    deleteItemAsync: vi.fn(),
  };
});

vi.mock('expo-secure-store', () => {
  return {
    setItemAsync: mocks.setItemAsync,
    getItemAsync: mocks.getItemAsync,
    deleteItemAsync: mocks.deleteItemAsync,
  };
});

describe('SecureStore', () => {
  describe('generic', () => {
    beforeEach(() => {
      vi.useFakeTimers();

      const createSecureStoreMock = () => {
        const _map = new Map();
        return {
          setItemAsync: (key: string, value: string): Promise<void> => {
            _map.set(key, value);
            return Promise.resolve();
          },
          getItemAsync: (key: string): Promise<string | null> => {
            return Promise.resolve(_map.get(key) || null);
          },
          deleteItemAsync: (key: string): Promise<void> => {
            _map.delete(key);
            return Promise.resolve();
          },
        };
      };
      const secureStoreMock = createSecureStoreMock();
      mocks.setItemAsync.mockImplementation(secureStoreMock.setItemAsync);
      mocks.getItemAsync.mockImplementation(secureStoreMock.getItemAsync);
      mocks.deleteItemAsync.mockImplementation(secureStoreMock.deleteItemAsync);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('sets a value correctly', async () => {
      const secureStore = createSecureStore();
      await secureStore.set(KEY, 'value');
      await vi.runAllTimersAsync();
      expect(await secureStore.get(KEY)).toBe('value');
    });

    test('returns null for a non-existent key', async () => {
      const secureStore = createSecureStore();
      expect(await secureStore.get(KEY)).toBeNull();
    });

    test('returns the last set value', async () => {
      const secureStore = createSecureStore();
      await secureStore.set(KEY, 'value1');
      await secureStore.set(KEY, 'value2');
      await vi.runAllTimersAsync();
      expect(await secureStore.get(KEY)).toBe('value2');
      await secureStore.set(KEY, 'value3');
      await vi.runAllTimersAsync();
      expect(await secureStore.get(KEY)).toBe('value3');
    });
  });

  describe('delayed write', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      const createSecureStoreMock = () => {
        const _map = new Map();
        return {
          setItemAsync: (key: string, value: string): Promise<void> => {
            _map.set(key, value);
            return new Promise(resolve => {
              setTimeout(() => resolve(), 3000);
            });
          },
          getItemAsync: (key: string): Promise<string | null> => {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(_map.get(key) || null);
              }, 3000);
            });
          },
          deleteItemAsync: (key: string): Promise<void> => {
            _map.delete(key);
            return new Promise(resolve => {
              setTimeout(resolve, 3000);
            });
          },
        };
      };
      const secureStoreMock = createSecureStoreMock();
      mocks.setItemAsync.mockImplementation(secureStoreMock.setItemAsync);
      mocks.getItemAsync.mockImplementation(secureStoreMock.getItemAsync);
      mocks.deleteItemAsync.mockImplementation(secureStoreMock.deleteItemAsync);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('sets a value async', async () => {
      const secureStore = createSecureStore();
      void secureStore.set(KEY, 'value');
      await vi.runAllTimersAsync();
      const value = secureStore.get(KEY);
      await vi.runAllTimersAsync();
      expect(await value).toBe('value');
    });

    test('sets the correct last value when many sets happen almost at the same time', async () => {
      const secureStore = createSecureStore();
      void secureStore.set(KEY, 'value');
      void secureStore.set(KEY, 'value2');
      void secureStore.set(KEY, 'value3');
      void secureStore.set(KEY, 'value4');
      void secureStore.set(KEY, 'value5');
      void secureStore.set(KEY, 'value6');
      await vi.runAllTimersAsync();
      const value = secureStore.get(KEY);
      await vi.runAllTimersAsync();
      expect(await value).toBe('value6');
    });
  });

  describe('chunking', () => {
    test('splits a value that is too large to be saved in one go', async () => {
      vi.useFakeTimers();

      const _map = new Map();
      const setItemAsync = (key: string, value: string): Promise<void> => {
        _map.set(key, value);
        return new Promise(resolve => {
          setTimeout(() => resolve(), 3000);
        });
      };
      const getItemAsync = (key: string): Promise<string | null> => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(_map.get(key) || null);
          }, 3000);
        });
      };
      const deleteItemAsync = (key: string): Promise<void> => {
        _map.delete(key);
        return new Promise(resolve => {
          setTimeout(resolve, 3000);
        });
      };

      mocks.setItemAsync.mockImplementation(setItemAsync);
      mocks.getItemAsync.mockImplementation(getItemAsync);
      mocks.deleteItemAsync.mockImplementation(deleteItemAsync);

      const secureStore = createSecureStore();
      void secureStore.set(KEY, JSON.stringify(DUMMY_TEST_LARGE_JSON));
      await vi.runAllTimersAsync();

      const value = secureStore.get(KEY);
      await vi.runAllTimersAsync();
      expect(await value).toBe(JSON.stringify(DUMMY_TEST_LARGE_JSON));

      const chunks = splitIntoChunks(JSON.stringify(DUMMY_TEST_LARGE_JSON));

      expect(_map.get('key-B-metadata')).toBe(JSON.stringify({ totalChunks: chunks.length }));
      for (let i = 0; i < chunks.length; i++) {
        expect(_map.get(`key-B-chunk-${i}`)).toBe(chunks[i]);
      }
      expect(_map.get('key-B-complete')).toBe('true');
      expect(_map.get('key-latest')).toBe('B');

      vi.useRealTimers();
    });

    test('keeps the last 2 values in two different slots A/B', async () => {
      vi.useFakeTimers();

      const _map = new Map();
      const setItemAsync = (key: string, value: string): Promise<void> => {
        _map.set(key, value);
        return new Promise(resolve => {
          setTimeout(() => resolve(), 3000);
        });
      };
      const getItemAsync = (key: string): Promise<string | null> => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(_map.get(key) || null);
          }, 3000);
        });
      };
      const deleteItemAsync = (key: string): Promise<void> => {
        _map.delete(key);
        return new Promise(resolve => {
          setTimeout(resolve, 3000);
        });
      };

      mocks.setItemAsync.mockImplementation(setItemAsync);
      mocks.getItemAsync.mockImplementation(getItemAsync);
      mocks.deleteItemAsync.mockImplementation(deleteItemAsync);

      const secureStore = createSecureStore();
      void secureStore.set(KEY, JSON.stringify(DUMMY_TEST_LARGE_JSON));
      await vi.runAllTimersAsync();
      void secureStore.set(KEY, 'new value');
      await vi.runAllTimersAsync();

      const value = secureStore.get(KEY);
      await vi.runAllTimersAsync();
      expect(await value).toBe('new value');

      const chunks = splitIntoChunks(JSON.stringify(DUMMY_TEST_LARGE_JSON));

      expect(_map.get('key-B-metadata')).toBe(JSON.stringify({ totalChunks: chunks.length }));
      for (let i = 0; i < chunks.length; i++) {
        expect(_map.get(`key-B-chunk-${i}`)).toBe(chunks[i]);
      }

      expect(_map.get('key-A-metadata')).toBe(JSON.stringify({ totalChunks: 1 }));
      expect(_map.get('key-A-chunk-0')).toBe('new value');
      expect(_map.get('key-A-complete')).toBe('true');
      expect(_map.get('key-latest')).toBe('A');

      vi.useRealTimers();
    });
  });

  describe('failures', () => {
    test('does not change the value if set fails', async () => {
      vi.useFakeTimers();
      const _map = new Map();
      _map.set('key-latest', 'A');
      _map.set('key-A-metadata', JSON.stringify({ totalChunks: 1 }));
      _map.set('key-A-chunk-0', 'initial value');
      _map.set('key-A-complete', 'true');
      let countBeforeFail = 0;
      const setItemAsync = (key: string, value: string): Promise<void> => {
        // the first two sets will succeed, the rest will fail
        if (countBeforeFail < 2) {
          _map.set(key, value);
          countBeforeFail++;
        }
        return new Promise(resolve => {
          setTimeout(() => resolve(), 3000);
        });
      };
      const getItemAsync = (key: string): Promise<string | null> => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(_map.get(key) || null);
          }, 3000);
        });
      };
      const deleteItemAsync = (key: string): Promise<void> => {
        _map.delete(key);
        return new Promise(resolve => {
          setTimeout(resolve, 3000);
        });
      };

      mocks.setItemAsync.mockImplementation(setItemAsync);
      mocks.getItemAsync.mockImplementation(getItemAsync);
      mocks.deleteItemAsync.mockImplementation(deleteItemAsync);

      const secureStore = createSecureStore();
      void secureStore.set(KEY, 'new value');
      await vi.runAllTimersAsync();
      const value = secureStore.get(KEY);
      await vi.runAllTimersAsync();
      expect(await value).toBe('initial value');
      vi.useRealTimers();
    });

    test('get returns null if set fails', async () => {
      vi.useFakeTimers();
      const _map = new Map();
      _map.set('key-latest', 'A');
      _map.set('key-A-metadata', JSON.stringify({ totalChunks: 1 }));
      _map.set('key-A-chunk-0', 'initial value');
      _map.set('key-A-complete', 'false');
      let countBeforeFail = 0;
      const setItemAsync = (key: string, value: string): Promise<void> => {
        // the first two sets will succeed, the rest will fail
        if (countBeforeFail < 2) {
          _map.set(key, value);
          countBeforeFail++;
        }
        return new Promise(resolve => {
          setTimeout(() => resolve(), 3000);
        });
      };
      const getItemAsync = (key: string): Promise<string | null> => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(_map.get(key) || null);
          }, 3000);
        });
      };
      const deleteItemAsync = (key: string): Promise<void> => {
        _map.delete(key);
        return new Promise(resolve => {
          setTimeout(resolve, 3000);
        });
      };

      mocks.setItemAsync.mockImplementation(setItemAsync);
      mocks.getItemAsync.mockImplementation(getItemAsync);
      mocks.deleteItemAsync.mockImplementation(deleteItemAsync);

      const secureStore = createSecureStore();
      void secureStore.set(KEY, 'new value');
      await vi.runAllTimersAsync();
      const value = secureStore.get(KEY);
      await vi.runAllTimersAsync();
      expect(await value).toBe(null);
      vi.useRealTimers();
    });
  });
});
