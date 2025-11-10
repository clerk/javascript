import type { ClerkClient, ClerkOptions } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';

import { commonEnvs } from './constants';

const clerkClient = (options?: ClerkOptions): ClerkClient => {
  const commonEnv = commonEnvs();
  return createClerkClient({
    secretKey: commonEnv.SECRET_KEY,
    machineSecretKey: commonEnv.MACHINE_SECRET_KEY,
    publishableKey: commonEnv.PUBLISHABLE_KEY,
    apiUrl: commonEnv.API_URL,
    apiVersion: commonEnv.API_VERSION,
    userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
    proxyUrl: commonEnv.PROXY_URL,
    domain: commonEnv.DOMAIN,
    isSatellite: commonEnv.IS_SATELLITE,
    sdkMetadata: commonEnv.SDK_METADATA,
    telemetry: {
      disabled: commonEnv.TELEMETRY_DISABLED,
      debug: commonEnv.TELEMETRY_DEBUG,
    },
    ...options,
  });
};

export { clerkClient };
