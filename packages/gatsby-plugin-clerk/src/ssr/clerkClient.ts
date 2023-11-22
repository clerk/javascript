import { Clerk } from '@clerk/backend';

import { API_URL, API_VERSION, SECRET_KEY } from '../constants';

const clerkClient = Clerk({
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  // TODO: Fetch version from package.json
  userAgent: 'gatsby-plugin-clerk',
});

const createClerkClient = Clerk;

// eslint-disable-next-line import/export
export { Clerk, clerkClient, createClerkClient };

// eslint-disable-next-line import/export
export * from '@clerk/backend';
