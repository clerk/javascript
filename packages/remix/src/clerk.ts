import Clerk from '@clerk/backend';

import { getEnvVariable } from './utils';

const apiKey = getEnvVariable('CLERK_API_KEY');

const clerk = Clerk({
  apiKey,
});

export { clerk };

export * from '@clerk/backend';
