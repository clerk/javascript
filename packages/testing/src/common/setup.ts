import { isProductionFromSecretKey, parsePublishableKey } from '@clerk/shared';
import dotenv from 'dotenv';

import { TESTING_TOKEN_API_URL } from './constants';
import type { ClerkSetupOptions, ClerkSetupReturn } from './types';

export const fetchEnvVars = async (options?: ClerkSetupOptions): Promise<ClerkSetupReturn> => {
  const log = (msg: string) => {
    if (options?.debug) {
      console.log(`Clerk: ${msg}`);
    }
  };

  log('Setting up Clerk...');
  dotenv.config({ path: ['.env.local', '.env'] });

  const publishableKey =
    options?.publishableKey ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.GATSBY_CLERK_PUBLISHABLE_KEY ||
    process.env.REACT_APP_CLERK_PUBLISHABLE_KEY ||
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const secretKey = process.env.CLERK_SECRET_KEY;
  let testingToken = process.env.CLERK_TESTING_TOKEN;

  if (!publishableKey) {
    throw new Error('You need to set the CLERK_PUBLISHABLE_KEY environment variable.');
  }

  if (!secretKey && !testingToken) {
    throw new Error('You need to set the CLERK_SECRET_KEY or the CLERK_TESTING_TOKEN environment variable.');
  }

  if (secretKey && !testingToken) {
    if (isProductionFromSecretKey(secretKey)) {
      throw new Error(
        'You are using a secret key from a production instance, but Testing Tokens only work in development instances.',
      );
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    };

    log('Fetching testing token from Clerk Backend API...');

    const apiUrl = process.env.CLERK_API_URL;
    const testingTokenApiUrl = apiUrl ? `${apiUrl}/v1/testing_tokens` : TESTING_TOKEN_API_URL;

    await fetch(testingTokenApiUrl, options)
      .then(response => {
        return response.json();
      })
      .then(data => {
        testingToken = data.token;
      })
      .catch(reason => {
        throw new Error('Failed to fetch testing token from Clerk API. Error: ' + reason);
      });
  }

  return {
    CLERK_FAPI: options?.frontendApiUrl || parsePublishableKey(publishableKey)?.frontendApi,
    CLERK_TESTING_TOKEN: testingToken,
  };
};
