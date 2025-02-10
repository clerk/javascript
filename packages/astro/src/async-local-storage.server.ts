import { type AsyncLocalStorage } from 'node:async_hooks';

async function createAsyncLocalStorage<Store extends object>(): Promise<AsyncLocalStorage<Store>> {
  const { AsyncLocalStorage } = await import('node:async_hooks');
  return new AsyncLocalStorage<Store>();
}

export const authAsyncStorage = await createAsyncLocalStorage();
