import { createClerkClient } from '@clerk/backend';

import { type DataFunctionArgs, loadOptions } from './loadOptions';

export const clerkClient = (args: DataFunctionArgs) => {
  const options = loadOptions(args);

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
