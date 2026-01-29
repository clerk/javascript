import { getEnvVariable } from '@clerk/shared/getEnvVariable';

import type { IsomorphicClerkOptions } from '../types';

/**
 * Gets an environment variable value, checking for Vite's VITE_ prefix first.
 * This allows React SDK users with Vite to use VITE_CLERK_* env vars
 * (which Vite exposes client-side) without manual configuration.
 *
 * Note: Empty string values are treated as "not set" and will fall through to
 * the next env var in the chain. This is intentional since empty values are
 * typically invalid for these options.
 *
 * @param name - The environment variable name without prefix (e.g., 'CLERK_PUBLISHABLE_KEY')
 * @returns The value of the environment variable, or empty string if not found
 */
const getEnvVar = (name: string): string => {
  // Check for Vite-prefixed env var first (client-side exposed)
  // Then fall back to unprefixed version (for SSR, Node.js, etc.)
  // Note: Uses || so empty string falls through to the next check
  return getEnvVariable(`VITE_${name}`) || getEnvVariable(name);
};

/**
 * Helper to get env fallback only when the option is undefined.
 * We check for undefined specifically (not falsy) to avoid conflicting with framework SDKs
 * that may pass an empty string when their env var is not set.
 *
 * Returns the env var value only if it's non-empty, otherwise returns undefined
 * to preserve the original behavior when no env var is set.
 */
const withEnvFallback = (value: string | undefined, envVarName: string): string | undefined => {
  if (value !== undefined) {
    return value;
  }
  const envValue = getEnvVar(envVarName);
  return envValue || undefined;
};

/**
 * Merges ClerkProvider options with environment variable fallbacks.
 * This supports Vite users who set VITE_CLERK_* or CLERK_* env vars.
 * Passed-in options always take priority over environment variables.
 *
 * Supported environment variables:
 * - VITE_CLERK_PUBLISHABLE_KEY / CLERK_PUBLISHABLE_KEY
 *
 * @param options - The options passed to ClerkProvider
 * @returns Options with environment variable fallbacks applied
 */
export const mergeWithEnv = (options: IsomorphicClerkOptions): IsomorphicClerkOptions => {
  // Get env fallback values (undefined if not set)
  const publishableKey = withEnvFallback(options.publishableKey, 'CLERK_PUBLISHABLE_KEY');

  // Only add publishableKey to result if it has a defined value
  // URL fallbacks removed due to compatibility issues with @clerk/react-router
  return {
    ...options,
    ...(publishableKey !== undefined && { publishableKey }),
  };
};
