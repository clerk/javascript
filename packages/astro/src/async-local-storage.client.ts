import type { AsyncLocalStorage } from 'node:async_hooks';

const sharedAsyncLocalStorageNotAvailableError = new Error(
  'Invariant: AsyncLocalStorage accessed in runtime where it is not available',
);

class FakeAsyncLocalStorage<Store extends object> implements AsyncLocalStorage<Store> {
  disable(): void {
    throw sharedAsyncLocalStorageNotAvailableError;
  }

  getStore(): Store | undefined {
    // This fake implementation of AsyncLocalStorage always returns `undefined`.
    return undefined;
  }

  run<R>(): R {
    throw sharedAsyncLocalStorageNotAvailableError;
  }

  exit<R>(): R {
    throw sharedAsyncLocalStorageNotAvailableError;
  }

  enterWith(): void {
    throw sharedAsyncLocalStorageNotAvailableError;
  }
}

function createAsyncLocalStorage<Store extends object>(): AsyncLocalStorage<Store> {
  return new FakeAsyncLocalStorage();
}

export const authAsyncStorage = createAsyncLocalStorage();
