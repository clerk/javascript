import type { ClerkClient, ClerkOptions } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';
import type { APIContext } from 'astro';

import { getSafeEnv } from './get-safe-env';

type CreateClerkClientWithOptions = (context: APIContext, options?: ClerkOptions) => ClerkClient;
const createClerkClientWithOptions: CreateClerkClientWithOptions = (context, options) =>
  createClerkClient({
    secretKey: getSafeEnv(context).sk,
    publishableKey: getSafeEnv(context).pk,
    apiUrl: getSafeEnv(context).apiUrl,
    apiVersion: getSafeEnv(context).apiVersion,
    // userAgent
    proxyUrl: getSafeEnv(context).proxyUrl,
    domain: getSafeEnv(context).domain,
    isSatellite: getSafeEnv(context).isSatellite,
    // TODO: Support telemetry and sdkMetadata

    ...options,
  });

const clerkClient = (context: APIContext) => createClerkClientWithOptions(context);

export { clerkClient };
