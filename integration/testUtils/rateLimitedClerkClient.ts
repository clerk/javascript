import type { ClerkClient } from '@clerk/backend';
import { isClerkAPIResponseError } from '@clerk/shared/error';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const JITTER_MAX_MS = 500;
const MAX_RETRY_DELAY_MS = 30_000;

const retryStats = { totalRetries: 0, callsRetried: new Set<string>() };

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRetryDelay(error: unknown, attempt: number): number {
  if (isClerkAPIResponseError(error) && typeof error.retryAfter === 'number') {
    return Math.min(error.retryAfter * 1000, MAX_RETRY_DELAY_MS);
  }
  return BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * JITTER_MAX_MS;
}

function recordRetry(path: string): void {
  retryStats.totalRetries++;
  retryStats.callsRetried.add(path);
}

export function printRateLimitSummary(): void {
  if (retryStats.totalRetries === 0) {
    console.log('[Rate Limit] No rate-limit retries occurred during this run.');
    return;
  }
  const methods = [...retryStats.callsRetried].join(', ');
  console.warn(
    `[Rate Limit] Summary: ${retryStats.totalRetries} retries across ${retryStats.callsRetried.size} API calls (${methods})`,
  );
}

async function retryOnRateLimit<T>(firstAttempt: Promise<T>, fn: () => Promise<T>, path: string): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return attempt === 0 ? await firstAttempt : await fn();
    } catch (error) {
      const isRateLimited = isClerkAPIResponseError(error) && error.status === 429;
      if (!isRateLimited || attempt === MAX_RETRIES) {
        throw error;
      }
      recordRetry(path);
      const delayMs = getRetryDelay(error, attempt);
      console.warn(`[Rate Limit] Retry ${attempt + 1}/${MAX_RETRIES} for ${path}, waiting ${Math.round(delayMs)}ms`);
      await sleep(delayMs);
    }
  }
  // Unreachable, but satisfies TypeScript
  throw new Error('Unreachable');
}

function createProxy(target: unknown, path: string[] = []): unknown {
  if (target === null || (typeof target !== 'object' && typeof target !== 'function')) {
    return target;
  }

  return new Proxy(target as object, {
    get(obj, prop, receiver) {
      if (typeof prop === 'symbol') {
        return Reflect.get(obj, prop, receiver);
      }
      const value = Reflect.get(obj, prop, receiver);
      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          const result = value.apply(obj, args);
          // Only wrap promises (async API calls), pass through sync returns
          if (result && typeof result === 'object' && typeof result.then === 'function') {
            const fullPath = [...path, prop].join('.');
            return retryOnRateLimit(result, () => value.apply(obj, args), fullPath);
          }
          return result;
        };
      }
      if (typeof value === 'object' && value !== null) {
        return createProxy(value, [...path, prop]);
      }
      return value;
    },
  });
}

export function withRateLimitRetry(client: ClerkClient): ClerkClient {
  return createProxy(client) as ClerkClient;
}
