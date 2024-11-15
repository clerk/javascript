import { createClerkClient } from '@clerk/backend';
import { isTruthy } from '@clerk/shared/underscore';
import type { H3Event } from 'h3';

// @ts-expect-error: Nitro import. Handled by Nuxt.
// eslint-disable-next-line import/no-unresolved
import { useRuntimeConfig } from '#imports';

export function clerkClient(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event);

  return createClerkClient({
    publishableKey: runtimeConfig.public.clerk.publishableKey,
    apiUrl: runtimeConfig.public.clerk.apiUrl,
    apiVersion: runtimeConfig.public.clerk.apiVersion,
    proxyUrl: runtimeConfig.public.clerk.proxyUrl,
    domain: runtimeConfig.public.clerk.domain,
    isSatellite: runtimeConfig.public.clerk.isSatellite,
    secretKey: runtimeConfig.clerk.secretKey,
    jwtKey: runtimeConfig.clerk.jwtKey,
    telemetry: {
      disabled: isTruthy(runtimeConfig.public.clerk.telemetry?.disabled),
      debug: isTruthy(runtimeConfig.public.clerk.telemetry?.debug),
    },
    userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
    sdkMetadata: {
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      environment: process.env.NODE_ENV,
    },
  });
}
