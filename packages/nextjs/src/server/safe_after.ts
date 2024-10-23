import { isNextFetcher } from './nextFetcher';

export type AfterTask<T = unknown> = Promise<T> | AfterCallback<T>;
export type AfterCallback<T = unknown> = () => T | Promise<T>;

export async function safe_after<T>(task: AfterTask<T>): Promise<void> {
  const __fetch = globalThis.fetch;

  if (!isNextFetcher(__fetch)) {
    return;
  }

  const { afterContext } = __fetch.__nextGetStaticStore().getStore() || {};

  if (!afterContext) {
    // If the application does not have the experimental flag turned on it needs to be a noop, otherwise Next.js will throw
    return;
  }

  // @ts-ignore
  const { unstable_after } = (await import('next/server.js')) || {};
  if (!unstable_after) {
    // Application uses a nextjs version that does not export the utility
    return;
  }

  unstable_after(task);
}
