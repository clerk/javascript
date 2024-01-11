import { createClerkClient } from '@clerk/backend';

import { API_URL, API_VERSION, SDK_METADATA, SECRET_KEY, TELEMETRY_DEBUG, TELEMETRY_DISABLED } from '../constants';

const clerkClient = createClerkClient({
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
  sdkMetadata: SDK_METADATA,
  telemetry: {
    disabled: TELEMETRY_DISABLED,
    debug: TELEMETRY_DEBUG,
  },
});

export { clerkClient };
export * from '@clerk/backend';
