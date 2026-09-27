import { type ReactNode, useEffect } from 'react';

import type { TokenCache } from '../../../cache/types';
import type { FakeClerk } from './fakeClerk';

type BehaviorEnvironment = {
  js: FakeClerk | null;
  nativeModule: unknown;
};

// Lives on globalThis so module-level mock factories see the same state after `vi.resetModules()`.
const registryKey = Symbol.for('@clerk/expo/nativeClientSyncBehavior');
const globalRegistry = globalThis as typeof globalThis & { [registryKey]?: BehaviorEnvironment };

export function activeEnvironment(): BehaviorEnvironment {
  globalRegistry[registryKey] ??= { js: null, nativeModule: null };
  return globalRegistry[registryKey];
}

export function setActiveEnvironment(environment: BehaviorEnvironment): void {
  globalRegistry[registryKey] = environment;
}

export function getClerkInstanceForActiveEnvironment(options?: { tokenCache?: TokenCache }): FakeClerk {
  const { js } = activeEnvironment();
  if (!js) {
    throw new Error('No native client sync behavior environment is active.');
  }
  js.tokenCache = options?.tokenCache;
  return js;
}

/** Stands in for `InternalClerkProvider`, which loads the Clerk instance after mounting. */
export function LoadingClerkProvider({ children, Clerk }: { children?: ReactNode; Clerk?: FakeClerk | null }) {
  useEffect(() => {
    void Clerk?.load();
  }, [Clerk]);
  return <>{children}</>;
}

/** A persistent token cache such as one backed by `expo-secure-store`. */
export class FakePersistentTokenCache implements TokenCache {
  #values = new Map<string, string>();

  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) {
      this.#values.set(key, value);
    }
  }

  read(key: string): string | null {
    return this.#values.get(key) ?? null;
  }

  getToken = (key: string): Promise<string | undefined | null> => Promise.resolve(this.#values.get(key) ?? null);

  saveToken = (key: string, token: string): Promise<void> => {
    this.#values.set(key, token);
    return Promise.resolve();
  };

  clearToken = (key: string): void => {
    this.#values.delete(key);
  };
}
