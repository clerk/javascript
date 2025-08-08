import { createClerkClient } from '@clerk/backend';

import {
  API_URL,
  API_VERSION,
  DOMAIN,
  IS_SATELLITE,
  MACHINE_SECRET_KEY,
  PROXY_URL,
  PUBLISHABLE_KEY,
  SDK_METADATA,
  SECRET_KEY,
  TELEMETRY_DEBUG,
  TELEMETRY_DISABLED,
} from './constants';

const clerkClientDefaultOptions = {
  secretKey: SECRET_KEY,
  publishableKey: PUBLISHABLE_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
  proxyUrl: PROXY_URL,
  domain: DOMAIN,
  isSatellite: IS_SATELLITE,
  machineSecretKey: MACHINE_SECRET_KEY,
  sdkMetadata: SDK_METADATA,
  telemetry: {
    disabled: TELEMETRY_DISABLED,
    debug: TELEMETRY_DEBUG,
  },
};

export const createClerkClientWithOptions: typeof createClerkClient = options =>
  createClerkClient({ ...clerkClientDefaultOptions, ...options });
