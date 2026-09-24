/**
 * Shared test utilities for machine tests.
 */

/** A deferred promise — resolve/reject captured outside the promise executor. */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Yields to the event loop, allowing microtasks (invoke onDone/onError) to settle. */
export const tick = () => new Promise<void>(r => setTimeout(r, 0));

/** No-op async function for dependency injection in tests. */
export const noop = async () => {};
