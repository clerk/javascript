function wait(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

const MAX_NUMBER_OF_RETRIES = 5;

// TODO: Move this to @clerk/shared and reuse it with @clerk/clerk-js
export async function callWithRetry<T>(
  fn: (...args: unknown[]) => Promise<T>,
  attempt = 1,
  maxAttempts = MAX_NUMBER_OF_RETRIES,
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (attempt >= maxAttempts) {
      throw e;
    }
    await wait(2 ** attempt * 100);

    return callWithRetry(fn, attempt + 1);
  }
}
