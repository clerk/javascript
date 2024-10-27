import type { ClerkClient, ClerkOptions } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';
import type { APIContext } from 'astro';

import { getSafeEnv } from './get-safe-env';

type ContextOrLocals = APIContext | APIContext['locals'];

type CreateClerkClientWithOptions = (context: ContextOrLocals, options?: ClerkOptions) => ClerkClient;
const createClerkClientWithOptions: CreateClerkClientWithOptions = (context, options) =>
  createClerkClient({
    secretKey: getSafeEnv(context).sk,
    publishableKey: getSafeEnv(context).pk,
    apiUrl: getSafeEnv(context).apiUrl,
    apiVersion: getSafeEnv(context).apiVersion,
    proxyUrl: getSafeEnv(context).proxyUrl,
    domain: getSafeEnv(context).domain,
    isSatellite: getSafeEnv(context).isSatellite,
    userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
    sdkMetadata: {
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      environment: import.meta.env.MODE,
    },
    telemetry: {
      disabled: getSafeEnv(context).telemetryDisabled,
      debug: getSafeEnv(context).telemetryDebug,
    },
    ...options,
  });

const clerkClient = (context: ContextOrLocals) => createClerkClientWithOptions(context);

export { clerkClient };
