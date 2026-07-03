export function timeLimit<T>(
  value: T | PromiseLike<T>,
  ms: number,
  controller?: Pick<AbortController, 'abort'>,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(`Timed out after ${ms}ms`);
      // Abort the underlying operation (e.g. a fetch) so it stops running instead of settling later.
      controller?.abort(error);
      reject(error);
    }, ms);

    // Let a Node process exit while the timeout is still pending; browsers return a number with no unref.
    (timeoutId as { unref?: () => void }).unref?.();
  });

  return Promise.race([Promise.resolve(value), timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}
