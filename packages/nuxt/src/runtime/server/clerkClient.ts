import { createClerkClient } from '@clerk/backend';
import { deprecated } from '@clerk/shared/deprecated';
import { isTruthy } from '@clerk/shared/underscore';
import type { H3Event } from 'h3';

// @ts-expect-error: Nitro import. Handled by Nuxt.
import { useRuntimeConfig } from '#imports';

function resolveApiUrl(runtimeConfig: ReturnType<typeof useRuntimeConfig>): string {
  if (runtimeConfig.clerk.apiUrl) {
    return runtimeConfig.clerk.apiUrl;
  }
  if (runtimeConfig.public.clerk.apiUrl) {
    deprecated('NUXT_PUBLIC_CLERK_API_URL', 'Use `NUXT_CLERK_API_URL` instead.');
    return runtimeConfig.public.clerk.apiUrl;
  }
  return 'https://api.clerk.com';
}

function resolveApiVersion(runtimeConfig: ReturnType<typeof useRuntimeConfig>): string {
  if (runtimeConfig.clerk.apiVersion) {
    return runtimeConfig.clerk.apiVersion;
  }
  if (runtimeConfig.public.clerk.apiVersion) {
    deprecated('NUXT_PUBLIC_CLERK_API_VERSION', 'Use `NUXT_CLERK_API_VERSION` instead.');
    return runtimeConfig.public.clerk.apiVersion;
  }
  return 'v1';
}

export function clerkClient(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event);

  return createClerkClient({
    publishableKey: runtimeConfig.public.clerk.publishableKey,
    apiUrl: resolveApiUrl(runtimeConfig),
    apiVersion: resolveApiVersion(runtimeConfig),
    proxyUrl: runtimeConfig.public.clerk.proxyUrl,
    domain: runtimeConfig.public.clerk.domain,
    isSatellite: runtimeConfig.public.clerk.isSatellite,
    secretKey: runtimeConfig.clerk.secretKey,
    machineSecretKey: runtimeConfig.clerk.machineSecretKey,
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
