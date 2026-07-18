type Milliseconds = number;

type RetryOptions = Partial<{
  /**
   * The base delay of the exponential backoff: either milliseconds, or a function
   * deriving them from the error that triggered the retry and the iteration number,
   * starting at 1 for the first retry.
   * The exponential factor, max delay, and jitter still apply.
   *
   * @default 125
   */
  initialDelay: Milliseconds | ((error: unknown, iteration: number) => Milliseconds);
  /**
   * The maximum delay between retries.
   * The delay between retries will never exceed this value.
   * If set to 0, the delay will increase indefinitely.
   *
   * @default 0
   */
  maxDelayBetweenRetries: Milliseconds;
  /**
   * The multiplier for the exponential backoff.
   *
   * @default 2
   */
  factor: number;
  /**
   * A function to determine if the operation should be retried.
   * The callback accepts the error that was thrown and the number of iterations.
   * The iterations variable references the number of retries AFTER attempt
   * that caused the error and starts at 1 (as in, this is the 1st, 2nd, nth retry).
   *
   * @default (error, iterations) => iterations < 5
   */
  shouldRetry: (error: unknown, iterations: number) => boolean;
  /**
   * Controls whether the helper should retry the operation immediately once before applying exponential backoff.
   * The delay for the immediate retry is 100ms.
   *
   * @default false
   */
  retryImmediately: boolean;
  /**
   * If true, the intervals will be multiplied by a factor in the range of [1,2].
   *
   * @default true
   */
  jitter: boolean;

  /**
   * A callback that is invoked before each retry attempt.
   * The callback receives the iteration number (starting from 1 for the first retry).
   * This can be used to modify request parameters, add headers, etc.
   */
  onBeforeRetry?: (iteration: number) => void | Promise<void>;
  /**
   * An AbortSignal that cancels retrying.
   * Aborting rejects the returned promise with the signal's abort reason, immediately
   * interrupting any pending delay. It does not abort a callback that is already executing.
   */
  signal: AbortSignal;
}>;

const defaultOptions = {
  initialDelay: 125,
  maxDelayBetweenRetries: 0,
  factor: 2,
  shouldRetry: (_: unknown, iteration: number) => iteration < 5,
  retryImmediately: false,
  jitter: true,
};

const RETRY_IMMEDIATELY_DELAY = 100;

const abortReason = (signal: AbortSignal): Error => signal.reason ?? new Error('The operation was aborted');

const sleep = async (ms: Milliseconds, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (!signal) {
      setTimeout(resolve, ms);
      return;
    }
    if (signal.aborted) {
      reject(abortReason(signal));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortReason(signal));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });

const applyJitter = (delay: Milliseconds, jitter: boolean) => {
  return jitter ? delay * (1 + Math.random()) : delay;
};

const createExponentialDelayAsyncFn = (
  opts: Required<Pick<RetryOptions, 'maxDelayBetweenRetries' | 'factor' | 'jitter'>> & Pick<RetryOptions, 'signal'>,
) => {
  let timesCalled = 0;

  const calculateDelayInMs = (base: Milliseconds) => {
    let delay = base * Math.pow(opts.factor, timesCalled);
    delay = applyJitter(delay, opts.jitter);
    return Math.min(opts.maxDelayBetweenRetries || delay, delay);
  };

  return async (base: Milliseconds): Promise<void> => {
    await sleep(calculateDelayInMs(base), opts.signal);
    timesCalled++;
  };
};

/**
 * Retries a callback until it succeeds or the shouldRetry function returns false.
 * See {@link RetryOptions} for the available options.
 */
export const retry = async <T>(callback: () => T | Promise<T>, options: RetryOptions = {}): Promise<T> => {
  let iterations = 0;
  const { shouldRetry, initialDelay, maxDelayBetweenRetries, factor, retryImmediately, jitter, onBeforeRetry, signal } =
    {
      ...defaultOptions,
      ...options,
    };

  const resolveInitialDelay = typeof initialDelay === 'function' ? initialDelay : () => initialDelay;
  const delay = createExponentialDelayAsyncFn({
    maxDelayBetweenRetries,
    factor,
    jitter,
    signal,
  });

  while (true) {
    if (signal?.aborted) {
      throw abortReason(signal);
    }

    try {
      const result = await callback();
      if (signal?.aborted) {
        throw abortReason(signal);
      }
      return result;
    } catch (e) {
      if (signal?.aborted) {
        throw abortReason(signal);
      }

      iterations++;
      if (!shouldRetry(e, iterations)) {
        throw e;
      }

      if (onBeforeRetry) {
        await onBeforeRetry(iterations);
      }

      if (retryImmediately && iterations === 1) {
        await sleep(applyJitter(RETRY_IMMEDIATELY_DELAY, jitter), signal);
      } else {
        await delay(resolveInitialDelay(e, iterations));
      }
    }
  }
};
