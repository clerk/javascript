import type { GetServerDataProps } from 'gatsby';

import { API_KEY, clerkClient, FRONTEND_API, PUBLISHABLE_KEY, SECRET_KEY } from './clerkClient';
import type { WithServerAuthOptions } from './types';
import { GatsbyRequestAdapter } from './utils';

export function authenticateRequest(context: GetServerDataProps, options: WithServerAuthOptions) {
  return clerkClient.authenticateRequest({
    ...options,
    apiKey: API_KEY,
    secretKey: SECRET_KEY,
    frontendApi: FRONTEND_API,
    publishableKey: PUBLISHABLE_KEY,
    requestAdapter: new GatsbyRequestAdapter(context),
  });
}
