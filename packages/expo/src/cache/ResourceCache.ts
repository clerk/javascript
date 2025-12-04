import type { ClientJSONSnapshot, EnvironmentJSONSnapshot } from '@clerk/shared/types';

import type { IStorage } from '../provider/singleton/types';
import type { ResourceCache, ResourceCacheInitOptions } from './types';

function createResourceCache<T>(key: string): ResourceCache<T> {
  if (!key) {
    throw new Error('Clerk: ResourceCache key is required!');
  }
  let storage: IStorage | null = null;
  let itemKey: string | null = null;

  const init = (opts: ResourceCacheInitOptions) => {
    if (!opts.storage || !opts.publishableKey) {
      throw new Error(`Clerk: ResourceCache for ${key} requires storage and publishableKey!`);
    }
    itemKey = `${key}_${opts.publishableKey.slice(-5)}`;
    storage = opts.storage();
  };

  const checkInit = (): boolean => {
    return !!storage && !!itemKey;
  };

  const assertInitiliazed = () => {
    if (!storage || !itemKey) {
      throw new Error(`Clerk: ResourceCache for ${key} not initialized!`);
    }
  };

  const load = async (): Promise<T | null> => {
    assertInitiliazed();
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const value = await storage!.get(itemKey!);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.log(`Clerk: Error loading value on ${key} from storage:`, error);
      return null;
    }
  };

  const save = async (value: T): Promise<void> => {
    assertInitiliazed();
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return await storage!.set(itemKey!, JSON.stringify(value));
    } catch (error) {
      console.log(`Clerk: Error saving value on ${key} in storage:`, error);
    }
  };

  const remove = async (): Promise<void> => {
    assertInitiliazed();
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return await storage!.set(itemKey!, '');
    } catch (error) {
      console.log(`Clerk: Error deleting value on ${key} from storage:`, error);
    }
  };

  return { checkInit, init, load, save, remove };
}

export const EnvironmentResourceCache = createResourceCache<EnvironmentJSONSnapshot>('__clerk_cache_environment');
export const ClientResourceCache = createResourceCache<ClientJSONSnapshot>('__clerk_cache_client');
export const SessionJWTCache = createResourceCache<string>('__clerk_cache_session_jwt');
