type Milliseconds = number;

type RetryOptions = Partial<{
  /**
   * The initial delay before the first retry.
   * @default 125
   */
  initialDelay: Milliseconds;
  /**
   * The maximum delay between retries.
   * The delay between retries will never exceed this value.
   * If set to 0, the delay will increase indefinitely.
   * @default 0
   */
  maxDelayBetweenRetries: Milliseconds;
  /**
   * The multiplier for the exponential backoff.
   * @default 2
   */
  factor: number;
  /**
   * A function to determine if the operation should be retried.
   * The callback accepts the error that was thrown and the number of iterations.
   * The iterations variable references the number of retries AFTER attempt
   * that caused the error and starts at 1 (as in, this is the 1st, 2nd, nth retry).
   * @default (error, iterations) => iterations < 5
   */
  shouldRetry: (error: unknown, iterations: number) => boolean;
  /**
   * Controls whether the helper should retry the operation immediately once before applying exponential backoff.
   * The delay for the immediate retry is 100ms.
   * @default false
   */
  retryImmediately: boolean;
  /**
   * If true, the intervals will be multiplied by a factor in the range of [1,2].
   * @default true
   */
  jitter: boolean;
}>;

const defaultOptions: Required<RetryOptions> = {
  initialDelay: 125,
  maxDelayBetweenRetries: 0,
  factor: 2,
  shouldRetry: (_: unknown, iteration: number) => iteration < 5,
  retryImmediately: false,
  jitter: true,
};

const RETRY_IMMEDIATELY_DELAY = 100;

const sleep = async (ms: Milliseconds) => new Promise(s => setTimeout(s, ms));

const applyJitter = (delay: Milliseconds, jitter: boolean) => {
  return jitter ? delay * (1 + Math.random()) : delay;
};

const createExponentialDelayAsyncFn = (
  opts: Required<Pick<RetryOptions, 'initialDelay' | 'maxDelayBetweenRetries' | 'factor' | 'jitter'>>,
) => {
  let timesCalled = 0;

  const calculateDelayInMs = () => {
    const constant = opts.initialDelay;
    const base = opts.factor;
    let delay = constant * Math.pow(base, timesCalled);
    delay = applyJitter(delay, opts.jitter);
    return Math.min(opts.maxDelayBetweenRetries || delay, delay);
  };

  return async (): Promise<void> => {
    await sleep(calculateDelayInMs());
    timesCalled++;
  };
};

/**
 * Retries a callback until it succeeds or the shouldRetry function returns false.
 * See {@link RetryOptions} for the available options.
 */
export const retry = async <T>(callback: () => T | Promise<T>, options: RetryOptions = {}): Promise<T> => {
  let iterations = 0;
  const { shouldRetry, initialDelay, maxDelayBetweenRetries, factor, retryImmediately, jitter } = {
    ...defaultOptions,
    ...options,
  };

  const delay = createExponentialDelayAsyncFn({
    initialDelay,
    maxDelayBetweenRetries,
    factor,
    jitter,
  });

  while (true) {
    try {
      return await callback();
    } catch (e) {
      iterations++;
      if (!shouldRetry(e, iterations)) {
        throw e;
      }
      if (retryImmediately && iterations === 1) {
        await sleep(applyJitter(RETRY_IMMEDIATELY_DELAY, jitter));
      } else {
        await delay();
      }
    }
  }
};
