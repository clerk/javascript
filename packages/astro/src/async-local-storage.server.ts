import { type AsyncLocalStorage } from 'node:async_hooks';

async function createAsyncLocalStorage<Store extends object>(): Promise<AsyncLocalStorage<Store>> {
  if (typeof window === 'undefined') {
    const { AsyncLocalStorage } = await import('node:async_hooks');
    return new AsyncLocalStorage();
  }

  return {} as AsyncLocalStorage<Store>;
}

export const authAsyncStorage = await createAsyncLocalStorage();
