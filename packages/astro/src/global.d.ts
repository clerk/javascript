declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;

declare module '#async-local-storage' {
  import type { AsyncLocalStorage } from 'node:async_hooks';

  export const authAsyncStorage: AsyncLocalStorage<unknown>;
}
