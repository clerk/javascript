type Milliseconds = number;

type RetryOptions = Partial<{
  /**
   * The initial delay before the first retry.
   * @default 125
   */
  firstDelay: Milliseconds;
  /**
   * The maximum delay between retries.
   * If set to 0, the delay will increase indefinitely.
   * @default 0
   */
  maxDelay: Milliseconds;
  /**
   * The multiplier for the exponential backoff.
   * @default 2
   */
  factor: number;
  /**
   * A function to determine if the operation should be retried.
   * The callback accepts the error that was thrown and the number of iterations.
   * The iterationsCount variable references the number of retries AFTER attempt
   * that caused the error and starts at 1 (as in, this is the 1st, 2nd, nth retry).
   * @default (error, iterationsCount) => iterationsCount < 5
   */
  shouldRetry: (error: unknown, iterationsCount: number) => boolean;
  /**
   * Controls whether the helper should retry the operation immediately once before applying exponential backoff.
   * @default true
   */
  retryImmediatelyOnce: boolean;
  /**
   * The delay for the immediate retry.
   * @default 100
   */
  retryImmediatelyDelay: Milliseconds;
  /**
   * If true, the intervals will be multiplied by a factor in the range of [1,2].
   * @default true
   */
  jitter: boolean;
}>;

const defaultOptions: Required<RetryOptions> = {
  firstDelay: 125,
  maxDelay: 0,
  factor: 2,
  shouldRetry: (_: unknown, iterationsCount: number) => iterationsCount < 5,
  retryImmediatelyOnce: true,
  retryImmediatelyDelay: 100,
  jitter: true,
};

const sleep = async (ms: Milliseconds) => new Promise(s => setTimeout(s, ms));

const applyJitter = (delay: Milliseconds, jitter: boolean) => {
  return jitter ? delay * (1 + Math.random()) : delay;
};

const createExponentialDelayAsyncFn = (
  opts: Required<Pick<RetryOptions, 'firstDelay' | 'maxDelay' | 'factor' | 'jitter'>>,
) => {
  let timesCalled = 0;

  const calculateDelayInMs = () => {
    const constant = opts.firstDelay;
    const base = opts.factor;
    let delay = constant * Math.pow(base, timesCalled);
    delay = applyJitter(delay, opts.jitter);
    return Math.min(opts.maxDelay || delay, delay);
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
  let iterationsCount = 0;
  const { shouldRetry, firstDelay, maxDelay, factor, retryImmediatelyOnce, retryImmediatelyDelay, jitter } = {
    ...defaultOptions,
    ...options,
  };

  const delay = createExponentialDelayAsyncFn({ firstDelay, maxDelay, factor, jitter });

  while (true) {
    try {
      return await callback();
    } catch (e) {
      iterationsCount++;
      if (!shouldRetry(e, iterationsCount)) {
        throw e;
      }
      if (retryImmediatelyOnce && iterationsCount === 1) {
        await sleep(applyJitter(retryImmediatelyDelay, jitter));
      } else {
        await delay();
      }
    }
  }
};
