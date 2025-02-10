type Milliseconds = number;

type BackoffOptions = Partial<{
  firstDelay: Milliseconds;
  maxDelay: Milliseconds;
  timeMultiple: number;
  shouldRetry: (error: unknown, iterationsCount: number) => boolean;
}>;

const defaultOptions: Required<BackoffOptions> = {
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
    return Math.min(opts.maxDelay || delay, delay);
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
  const { shouldRetry, firstDelay, maxDelay, timeMultiple } = {
    ...defaultOptions,
    ...options,
  };
  const delay = createExponentialDelayAsyncFn({ firstDelay, maxDelay, timeMultiple });

  while (true) {
    try {
      return await callback();
    } catch (e) {
      iterationsCount++;
      if (!shouldRetry(e, iterationsCount)) {
        throw e;
      }
      await delay();
    }
  }
};
