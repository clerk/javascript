import { clerkSetup } from '@clerk/testing/playwright';

import { instanceKeys } from '../../../../integration/presets/envs';

/**
 * Global setup function for Playwright tests in the sandbox environment.
 * Configures Clerk authentication keys from the sandbox instance and initializes
 * the Clerk testing environment before running integration tests.
 *
 * @throws {Error} When sandbox instance keys are not found
 */
async function globalSetup(): Promise<void> {
  const keys = instanceKeys.get('sandbox');

  if (!keys) throw new Error('Sandbox instance keys not found');

  process.env.CLERK_SECRET_KEY = keys.sk;
  process.env.CLERK_PUBLISHABLE_KEY = keys.pk;

  await clerkSetup();
}

export default globalSetup;
