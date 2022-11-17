import Clerk from '@clerk/backend';

import { getEnvVariable } from './utils';

const apiKey = getEnvVariable('CLERK_API_KEY');

const clerk = Clerk({
  apiKey,
  // TODO: Fetch version from package.json
  userAgent: '@clerk/remix',
});

export { clerk };

export * from '@clerk/backend';
