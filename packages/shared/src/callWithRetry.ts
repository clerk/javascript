function wait(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

const MAX_NUMBER_OF_RETRIES = 5;

/**
 * Retry callback function every few hundred ms (with an exponential backoff
 * based on the current attempt) until the maximum attempts has reached or
 * the callback is executed successfully. The default number of maximum
 * attempts is 5 and retries are triggered when callback throws an error.
 */
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

    return callWithRetry(fn, attempt + 1, maxAttempts);
  }
}
