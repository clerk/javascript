// maximum number of retries on 503 responses
const MAX_RETRIES = 5;

// base delay in ms for exponential backoff
const BASE_DELAY_MS = 500;

// longest delay we will allow even if more is specified by Retry-After header is 1 minute.
const MAX_DELAY_MS = 60000;

/**
 * wraps a fetch function to retry on 503 responses only, passing all other responses through and
 * respecting the abort controller signal.
 *
 * if server provides a Retry-After header, that is respected (within reason), otherwise we use exponential
 * backoff based on the number of attempts.
 *
 * retry is attempted up to MAX_RETRIES times with exponential backoff between 0 and 2^n * BASE_DELAY_MS.
 *
 */
export function with503Retry(fetch: typeof globalThis.fetch) {
  return async function fetchWithRetry503(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // want to respect abort signals if provided
    const abortSignal = init?.signal;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      // fetch will throw if already aborted
      const response = await fetch(input, init);

      if (response.status !== 503) {
        // If not a 503, return the response immediately
        return response;
      }

      if (attempt >= MAX_RETRIES) {
        // return the last response
        return response;
      }

      // if there is a retry after, we'll respect that as the server is explicitly indicating when to retry.
      const retryAfterMs = getRetryAfterMs(response.headers);

      if (retryAfterMs !== undefined) {
        // if the value is 0, we retry immediately as it is explicitly indicated by server. Jitter is not
        // applied in this case, as the server is instructing the wait time due to some knowledge it has.
        if (retryAfterMs > 0) {
          // note that we clamp the maximum delay to avoid excessively long waits, even if server indicates longer
          // that could result in a muisconfiguration or error on server side causing request to delay for years
          // (or millennia?)
          await waitForTimeoutOrCancel(Math.min(retryAfterMs, MAX_DELAY_MS), abortSignal);
        }
        continue; // Proceed to next attempt
      }

      // no Retry-After header, so we use exponential backoff.

      // Calculate delay
      const delay = Math.random() * Math.pow(2, attempt) * BASE_DELAY_MS;

      // Wait for the delay before retrying, but abort if signal is triggered
      await waitForTimeoutOrCancel(delay, abortSignal);

      // Proceed to next attempt
    }

    // This point should never be reached
    throw new Error('Unexpected error in fetchWithRetry503');
  };
}

/**
 * Helper function to wait for a timeout or abort with Aborted if signal is triggered
 */
async function waitForTimeoutOrCancel(delay: number, signal: AbortSignal | null | undefined): Promise<void> {
  if (!signal) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }
  return await new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      clearTimeout(timeoutId); // timeoutId is defined, hoisting.
      // Reject the promise if aborted using standard DOMException for AbortError
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort);
    const timeoutId = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, delay);
  });
}

/**
 * either returns number of milliseconds to wait as instructed by the server, or undefined
 * if no valid Retry-After header is present.
 *
 * note that 0 is a valid retry-after value, and explicitly indicates no wait and that the
 * client should retry immediately.
 *
 * Handles both delta-seconds and HTTP-date formats, returning the number of milliseconds to
 * wait from now if HTTP-date is provided. If it is in the past, returns 0.
 *
 * does not clamp the upper bound value, that must be handled by the caller.
 *
 */
export function getRetryAfterMs(headers?: Headers): number | undefined {
  const retryAfter = headers?.get('Retry-After');
  if (!retryAfter) {
    return;
  }

  const intValue = parseInt(retryAfter, 10);
  if (!isNaN(intValue)) {
    if (intValue < 0) {
      // invalid, treat as no header present
      return;
    } else if (intValue === 0) {
      // explicit immediate retry
      return 0;
    }
    return Math.ceil(intValue) * 1000; // return whole integers as milliseconds only.
  }

  // reminder: https://jsdate.wtf/
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    const value = Math.ceil(date.getTime() - Date.now());
    if (value < 0) {
      // date is in the past, so we return 0
      return 0;
    }
    return value;
  }

  // otherwise the date was invalid so we treat as no header present
  return;
}

/**
 * returns number of full seconds to wait as instructed by the server, or undefined
 * if no valid Retry-After header is present.
 *
 * @see getRetryAfterMs
 */
export function getRetryAfterSeconds(headers?: Headers): number | undefined {
  const ms = getRetryAfterMs(headers);
  if (ms === undefined) {
    return;
  }
  return Math.ceil(ms / 1000);
}
