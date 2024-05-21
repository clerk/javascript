import type { ClerkSetupOptions } from '../common';
import { fetchEnvVars } from '../common';

/**
 * Sets up Clerk for testing by fetching the testing token from the Clerk Backend API.
 *
 * @param options.publishableKey - The publishable key for your Clerk dev instance.
 * @param options.frontendApiUrl - The frontend API URL for your Clerk dev instance, without the protocol. It overrides the Frontend API URL parsed from the publishable key.
 * @param options.debug - Enable debug logs.
 * @returns A promise that resolves when Clerk is set up.
 *
 * @throws An error if the publishable key or the secret key is not provided.
 * @throws An error if the secret key is from a production instance.
 * @throws An error if the testing token cannot be fetched from the Clerk Backend API.
 */
export const clerkSetup = async (options?: ClerkSetupOptions) => {
  const { CLERK_FAPI, CLERK_TESTING_TOKEN } = await fetchEnvVars(options);
  process.env.CLERK_FAPI = CLERK_FAPI;
  process.env.CLERK_TESTING_TOKEN = CLERK_TESTING_TOKEN;
};
