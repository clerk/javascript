import Clerk from '@clerk/backend';

import { getEnvVariable } from './utils';

const apiKey = getEnvVariable('CLERK_API_KEY');
if (!apiKey) {
  throw Error('The CLERK_API_KEY environment variable must be set to use imports from @clerk/remix/api.');
}

const clerk = Clerk({
  apiKey,
});

export { clerk };

export * from '@clerk/backend';
