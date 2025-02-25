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
    setGenericPassword: vi.fn(),
    getGenericPassword: vi.fn(),
    resetGenericPassword: vi.fn(),
  };
});

vi.mock('react-native-keychain', () => {
  return {
    setGenericPassword: mocks.setGenericPassword,
    getGenericPassword: mocks.getGenericPassword,
    resetGenericPassword: mocks.resetGenericPassword,
  };
});

describe('SecureStore', () => {
  describe('generic', () => {
    beforeEach(() => {
      vi.useFakeTimers();

      const createSecureStoreMock = () => {
        const _map = new Map();
        return {
          setGenericPassword: (key: string, value: string): Promise<boolean> => {
            _map.set(key, value);
            return Promise.resolve(true);
          },
          getGenericPassword: (key: string): Promise<{ username: string; password: string } | false> => {
            const value = _map.get(key);
            return Promise.resolve(value ? { username: key, password: value } : false);
          },
          resetGenericPassword: (key: string): Promise<boolean> => {
            _map.delete(key);
            return Promise.resolve(true);
          },
        };
      };
      const secureStoreMock = createSecureStoreMock();
      mocks.setGenericPassword.mockImplementation(secureStoreMock.setGenericPassword);
      mocks.getGenericPassword.mockImplementation(secureStoreMock.getGenericPassword);
      mocks.resetGenericPassword.mockImplementation(secureStoreMock.resetGenericPassword);
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
          setGenericPassword: (key: string, value: string): Promise<boolean> => {
            _map.set(key, value);
            return new Promise(resolve => {
              setTimeout(() => resolve(true), 3000);
            });
          },
          getGenericPassword: (key: string): Promise<{ username: string; password: string } | false> => {
            return new Promise(resolve => {
              setTimeout(() => {
                const value = _map.get(key);
                resolve(value ? { username: key, password: value } : false);
              }, 3000);
            });
          },
          resetGenericPassword: (key: string): Promise<boolean> => {
            _map.delete(key);
            return new Promise(resolve => {
              setTimeout(() => resolve(true), 3000);
            });
          },
        };
      };
      const secureStoreMock = createSecureStoreMock();
      mocks.setGenericPassword.mockImplementation(secureStoreMock.setGenericPassword);
      mocks.getGenericPassword.mockImplementation(secureStoreMock.getGenericPassword);
      mocks.resetGenericPassword.mockImplementation(secureStoreMock.resetGenericPassword);
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
      const setGenericPassword = (key: string, value: string): Promise<boolean> => {
        _map.set(key, value);
        return new Promise(resolve => {
          setTimeout(() => resolve(true), 3000);
        });
      };
      const getGenericPassword = (key: string): Promise<{ username: string; password: string } | false> => {
        return new Promise(resolve => {
          setTimeout(() => {
            const value = _map.get(key);
            resolve(value ? { username: key, password: value } : false);
          }, 3000);
        });
      };
      const resetGenericPassword = (key: string): Promise<boolean> => {
        _map.delete(key);
        return new Promise(resolve => {
          setTimeout(() => resolve(true), 3000);
        });
      };

      mocks.setGenericPassword.mockImplementation(setGenericPassword);
      mocks.getGenericPassword.mockImplementation(getGenericPassword);
      mocks.resetGenericPassword.mockImplementation(resetGenericPassword);

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
      const setGenericPassword = (key: string, value: string): Promise<boolean> => {
        _map.set(key, value);
        return new Promise(resolve => {
          setTimeout(() => resolve(true), 3000);
        });
      };
      const getGenericPassword = (key: string): Promise<{ username: string; password: string } | false> => {
        return new Promise(resolve => {
          setTimeout(() => {
            const value = _map.get(key);
            resolve(value ? { username: key, password: value } : false);
          }, 3000);
        });
      };
      const resetGenericPassword = (key: string): Promise<boolean> => {
        _map.delete(key);
        return new Promise(resolve => {
          setTimeout(() => resolve(true), 3000);
        });
      };

      mocks.setGenericPassword.mockImplementation(setGenericPassword);
      mocks.getGenericPassword.mockImplementation(getGenericPassword);
      mocks.resetGenericPassword.mockImplementation(resetGenericPassword);

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
      const setGenericPassword = (key: string, value: string): Promise<boolean> => {
        // the first two sets will succeed, the rest will fail
        if (countBeforeFail < 2) {
          _map.set(key, value);
          countBeforeFail++;
        }
        return new Promise(resolve => {
          setTimeout(() => resolve(false), 3000);
        });
      };
      const getGenericPassword = (key: string): Promise<{ username: string; password: string } | false> => {
        return new Promise(resolve => {
          setTimeout(() => {
            const value = _map.get(key);
            resolve(value ? { username: key, password: value } : false);
          }, 3000);
        });
      };
      const resetGenericPassword = (key: string): Promise<boolean> => {
        _map.delete(key);
        return new Promise(resolve => {
          setTimeout(() => resolve(true), 3000);
        });
      };

      mocks.setGenericPassword.mockImplementation(setGenericPassword);
      mocks.getGenericPassword.mockImplementation(getGenericPassword);
      mocks.resetGenericPassword.mockImplementation(resetGenericPassword);

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
      const setGenericPassword = (key: string, value: string): Promise<boolean> => {
        // the first two sets will succeed, the rest will fail
        if (countBeforeFail < 2) {
          _map.set(key, value);
          countBeforeFail++;
        }
        return new Promise(resolve => {
          setTimeout(() => resolve(false), 3000);
        });
      };
      const getGenericPassword = (key: string): Promise<{ username: string; password: string } | false> => {
        return new Promise(resolve => {
          setTimeout(() => {
            const value = _map.get(key);
            resolve(value ? { username: key, password: value } : false);
          }, 3000);
        });
      };
      const resetGenericPassword = (key: string): Promise<boolean> => {
        _map.delete(key);
        return new Promise(resolve => {
          setTimeout(() => resolve(true), 3000);
        });
      };

      mocks.setGenericPassword.mockImplementation(setGenericPassword);
      mocks.getGenericPassword.mockImplementation(getGenericPassword);
      mocks.resetGenericPassword.mockImplementation(resetGenericPassword);

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
