export interface RetryOptions {
  jitter?: boolean;
  maxAttempts: number;
  shouldRetry: (error: unknown) => boolean | Promise<boolean>;
}

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const calculateBackoff = (attempt: number, jitter: boolean): number => {
  const baseDelay = Math.pow(2, attempt + 1) * 1_000;

  if (!jitter) {
    return baseDelay;
  }

  return baseDelay * (0.5 + Math.random() * 0.5);
};

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const shouldRetry = await Promise.resolve(options.shouldRetry(error));

      if (!shouldRetry) {
        throw error;
      }

      const isLastAttempt = attempt === options.maxAttempts - 1;

      if (isLastAttempt) {
        throw error;
      }

      const backoffMs = calculateBackoff(attempt, options.jitter ?? true);
      await sleep(backoffMs);
    }
  }

  throw lastError;
}
