export function timeLimit<T>(value: T | PromiseLike<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);

    // Let a Node process exit while the timeout is still pending; browsers return a number with no unref.
    (timeoutId as { unref?: () => void }).unref?.();
  });

  return Promise.race([Promise.resolve(value), timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}
