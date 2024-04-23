import { parsePublishableKey } from '@clerk/shared/keys';
import dotenv from 'dotenv';

type ClerkSetupParams = {
  /*
   * The publishable key for your Clerk dev instance.
   * If not provided, the library will look for the key in the following environment variables:
   * - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   * - VITE_CLERK_PUBLISHABLE_KEY
   * - CLERK_PUBLISHABLE_KEY
   * - GATSBY_CLERK_PUBLISHABLE_KEY
   * - REACT_APP_CLERK_PUBLISHABLE_KEY
   * - EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
   */
  publishableKey?: string;
  /*
   * The frontend API URL for your Clerk dev instance, without the protocol.
   * If provided, it overrides the Frontend API URL parsed from the publishable key.
   * Example: 'relieved-chamois-66.accounts.dev'
   */
  frontendApiUrl?: string;
  /*
   * Enable debug mode.
   */
  debug?: boolean;
};

const TESTING_TOKEN_API_URL = 'https://api.clerk.com/v1/testing_tokens';

export const clerkSetup = async (options?: ClerkSetupParams) => {
  const log = (msg: string) => {
    if (options?.debug) {
      console.log(`Clerk: ${msg}`);
    }
  };

  log('Setting up Clerk...');
  dotenv.config({ path: ['.env.local', '.env'] });

  const pubKey =
    options?.publishableKey ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.GATSBY_CLERK_PUBLISHABLE_KEY ||
    process.env.REACT_APP_CLERK_PUBLISHABLE_KEY ||
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const secretKey = process.env.CLERK_SECRET_KEY;
  let testingToken = process.env.CLERK_TESTING_TOKEN;

  if (!pubKey) {
    throw new Error('You need to set the CLERK_PUBLISHABLE_KEY environment variable.');
  }

  if (!secretKey && !testingToken) {
    throw new Error('You need to set the CLERK_SECRET_KEY or the CLERK_TESTING_KEY environment variable.');
  }

  if (!testingToken) {
    if (secretKey?.startsWith('sk_live_') || secretKey?.startsWith('live_')) {
      throw new Error('You are using a live secret key. E2E testing is only supported in dev instances.');
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    };

    log('Fetching testing token from Clerk API...');

    const apiUrl = process.env.CLERK_API_URL;
    const testingTokenApiUrl = apiUrl ? `${apiUrl}/v1/testing_tokens` : TESTING_TOKEN_API_URL;

    await fetch(testingTokenApiUrl, options)
      .then(response => {
        return response.json();
      })
      .then(data => {
        testingToken = data.token;
        log('Testing token fetched successfully!');
      })
      .catch(() => {
        throw new Error('Failed to fetch testing token from Clerk API');
      });
  }

  process.env.CLERK_FAPI = options?.frontendApiUrl || parsePublishableKey(pubKey)?.frontendApi;
  process.env.CLERK_TESTING_TOKEN = testingToken;
  log('Setup complete!');
};
