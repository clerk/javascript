import { clerkSetup } from '@clerk/testing/playwright';

import { instanceKeys } from '../../../../integration/presets/envs';

async function globalSetup() {
  const keys = instanceKeys.get('sandbox');

  if (!keys) throw new Error('Sandbox instance keys not found');

  process.env.CLERK_SECRET_KEY = keys.sk;
  process.env.CLERK_PUBLISHABLE_KEY = keys.pk;

  await clerkSetup();
}

export default globalSetup;
