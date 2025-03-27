import { Clerk as BackendApiClient } from '@clerk/backend-sdk';

import { joinPaths } from '../util/path';

export type CreateBackendApiOptions = {
  /* Secret Key */
  secretKey?: string;
  /* Backend API URL */
  apiUrl?: string;
  /* Backend API version */
  apiVersion?: string;
  /* Library/SDK name */
  userAgent?: string;
  /**
   * Allow requests without specifying a secret key. In most cases this should be set to `false`.
   * Defaults to `true`.
   */
  requireSecretKey?: boolean;
};

export type ApiClient = ReturnType<typeof createBackendApiClient>;

export function createBackendApiClient(options: CreateBackendApiOptions) {
  const serverURL = options.apiUrl ? joinPaths(options.apiUrl, options.apiVersion) : undefined;

  const api = new BackendApiClient({
    bearerAuth: options.secretKey,
    serverURL,
    // userAgent: options.userAgent, // TODO: Add dynamic user agent
  });

  return api;
}
