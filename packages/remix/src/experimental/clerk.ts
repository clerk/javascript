import Clerk from '@clerk/backend';

import { getEnvVariable } from './utils';

const apiKey = getEnvVariable('CLERK_API_KEY');

const clerkClient = Clerk({
  apiKey,
  // TODO: Fetch version from package.json
  userAgent: '@clerk/remix',
});

const createClerkClient = Clerk;

export { clerkClient, createClerkClient, Clerk };

export * from '@clerk/backend';
