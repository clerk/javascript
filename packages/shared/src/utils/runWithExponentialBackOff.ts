type Milliseconds = number;

type BackoffOptions = Partial<{
  maxRetries: number;
  firstDelay: Milliseconds;
  maxDelay: Milliseconds;
  timeMultiple: number;
  shouldRetry: (error: unknown, iterationsCount: number) => boolean;
}>;

const defaultOptions: Required<BackoffOptions> = {
  maxRetries: 10,
  firstDelay: 125,
  maxDelay: 0,
  timeMultiple: 2,
  shouldRetry: () => true,
};

const sleep = async (ms: Milliseconds) => new Promise(s => setTimeout(s, ms));

const createExponentialDelayAsyncFn = (opts: {
  firstDelay: Milliseconds;
  maxDelay: Milliseconds;
  timeMultiple: number;
}) => {
  let timesCalled = 0;

  const calculateDelayInMs = () => {
    const constant = opts.firstDelay;
    const base = opts.timeMultiple;
    const delay = constant * Math.pow(base, timesCalled);
    if (!opts.maxDelay) {
      return delay;
    } else {
      return delay <= opts.maxDelay ? delay : opts.maxDelay;
    }
  };

  return async (): Promise<void> => {
    await sleep(calculateDelayInMs());
    timesCalled++;
  };
};

export const runWithExponentialBackOff = async <T>(
  callback: () => T | Promise<T>,
  options: BackoffOptions = {},
): Promise<T> => {
  let iterationsCount = 0;
  const { maxRetries, shouldRetry, firstDelay, maxDelay, timeMultiple } = {
    ...defaultOptions,
    ...options,
  };
  const maxRetriesReached = () => iterationsCount === maxRetries;
  const delay = createExponentialDelayAsyncFn({ firstDelay, maxDelay, timeMultiple });

  while (!maxRetriesReached()) {
    try {
      return await callback();
    } catch (e) {
      iterationsCount++;
      if (!shouldRetry(e, iterationsCount) || maxRetriesReached()) {
        throw e;
      }
      await delay();
    }
  }

  // This should be impossible to reach, but it makes TS happy
  throw new Error('Something went wrong');
};
