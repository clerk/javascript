import { beforeEach, describe, expect, test } from 'vitest';

import type { IStorage } from '../../provider/singleton/types';
import { SessionJWTCache } from '../ResourceCache';

const store = new Map<string, string>();
const storage = (): IStorage => ({
  get: key => Promise.resolve(store.get(key) ?? null),
  set: (key, value) => {
    store.set(key, value);
    return Promise.resolve();
  },
});

const buildKey = (frontendApi: string) => `pk_test_${btoa(`${frontendApi}$`)}`;

beforeEach(() => {
  store.clear();
});

describe('ResourceCache', () => {
  test('isolates entries between instances whose publishable keys share a suffix', async () => {
    const first = buildKey('a.clerk.accounts.dev');
    const second = buildKey('foo-bar-12.clerk.accounts.dev');
    expect(first.slice(-5)).toBe(second.slice(-5));

    SessionJWTCache.init({ publishableKey: first, storage });
    await SessionJWTCache.save('jwt-for-first');

    SessionJWTCache.init({ publishableKey: second, storage });
    await expect(SessionJWTCache.load()).resolves.toBeNull();

    SessionJWTCache.init({ publishableKey: first, storage });
    await expect(SessionJWTCache.load()).resolves.toBe('jwt-for-first');
  });

  test('uses storage keys that expo-secure-store accepts', async () => {
    const padded = buildKey('ab.clerk.accounts.dev');
    expect(padded.endsWith('=')).toBe(true);

    SessionJWTCache.init({ publishableKey: padded, storage });
    await SessionJWTCache.save('jwt');

    for (const storedKey of store.keys()) {
      expect(storedKey).toMatch(/^[\w.-]+$/);
    }
  });
});
