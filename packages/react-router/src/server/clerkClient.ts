import { createClerkClient } from '@clerk/backend';

import { type DataFunctionArgs, loadOptions } from './loadOptions';
import type { ClerkMiddlewareOptions } from './types';

export const clerkClient = (args: DataFunctionArgs, overrides: ClerkMiddlewareOptions = {}) => {
  const options = loadOptions(args, overrides);

  const { apiUrl, secretKey, jwtKey, proxyUrl, isSatellite, domain, publishableKey, machineSecretKey } = options;

  return createClerkClient({
    apiUrl,
    secretKey,
    jwtKey,
    proxyUrl,
    isSatellite,
    domain,
    publishableKey,
    machineSecretKey,
    userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
  });
};
