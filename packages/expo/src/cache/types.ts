import type { IStorage } from '../provider/singleton/types';

export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => void;
}

export interface ResourceCache<T> {
  init: (opts: ResourceCacheInitOptions) => void;
  load: () => Promise<T | null>;
  save: (value: T) => Promise<void>;
}

export type ResourceCacheInitOptions = {
  storage: () => IStorage;
  publishableKey: string;
};
