import { createClerkClient } from '@clerk/backend';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { parsePublishableKey } from '@clerk/shared/keys';
import dotenv from 'dotenv';

import type { ClerkSetupOptions, ClerkSetupReturn } from './types';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const JITTER_MAX_MS = 500;
const MAX_RETRY_DELAY_MS = 30_000;
const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);

async function fetchWithRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = isClerkAPIResponseError(error) && RETRYABLE_STATUS_CODES.has(error.status);
      if (!isRetryable || attempt === MAX_RETRIES) {
        throw error;
      }
      const delay =
        typeof error.retryAfter === 'number'
          ? Math.min(error.retryAfter * 1000, MAX_RETRY_DELAY_MS)
          : Math.min(BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * JITTER_MAX_MS, MAX_RETRY_DELAY_MS);
      console.warn(`[Retry] ${error.status} for ${label}, attempt ${attempt + 1}/${MAX_RETRIES}, waiting ${Math.round(delay)}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}

export const fetchEnvVars = async (options?: ClerkSetupOptions): Promise<ClerkSetupReturn> => {
  const { debug = false, dotenv: loadDotEnv = true, ...rest } = options || {};

  const log = (msg: string) => {
    if (debug) {
      console.log(`Clerk: ${msg}`);
    }
  };

  log('Setting up Clerk...');

  if (loadDotEnv) {
    dotenv.config({ path: ['.env.local', '.env'] });
  }

  const publishableKey =
    rest.publishableKey ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.REACT_APP_CLERK_PUBLISHABLE_KEY ||
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const secretKey = rest.secretKey || process.env.CLERK_SECRET_KEY;
  let testingToken = process.env.CLERK_TESTING_TOKEN;

  if (!publishableKey) {
    throw new Error('You need to set the CLERK_PUBLISHABLE_KEY environment variable.');
  }

  if (!secretKey && !testingToken) {
    throw new Error('You need to set the CLERK_SECRET_KEY or the CLERK_TESTING_TOKEN environment variable.');
  }

  if (secretKey && !testingToken) {
    log('Fetching testing token from Clerk Backend API...');

    try {
      const apiUrl = (rest as any)?.apiUrl || process.env.CLERK_API_URL;
      const clerkClient = createClerkClient({ secretKey, apiUrl });
      const tokenData = await fetchWithRetry(
        () => clerkClient.testingTokens.createTestingToken(),
        'testingTokens.createTestingToken',
      );
      testingToken = tokenData.token;
    } catch (err) {
      console.error('Failed to fetch testing token from Clerk API.');
      throw err;
    }
  }

  return {
    CLERK_FAPI: options?.frontendApiUrl || parsePublishableKey(publishableKey)?.frontendApi,
    CLERK_TESTING_TOKEN: testingToken,
  };
};
