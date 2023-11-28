import { Clerk } from '@clerk/backend';

import { API_URL, API_VERSION, SDK_METADATA, SECRET_KEY, TELEMETRY_DEBUG, TELEMETRY_DISABLED } from '../constants';

const clerkClient = Clerk({
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  // TODO: Fetch version from package.json
  userAgent: 'gatsby-plugin-clerk',
  sdkMetadata: SDK_METADATA,
  telemetry: {
    disabled: TELEMETRY_DISABLED,
    debug: TELEMETRY_DEBUG,
  },
});

const createClerkClient = Clerk;

// eslint-disable-next-line import/export
export { Clerk, clerkClient, createClerkClient };

// eslint-disable-next-line import/export
export * from '@clerk/backend';
