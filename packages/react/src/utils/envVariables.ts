import { getEnvVariable } from '@clerk/shared/getEnvVariable';

/**
 * Gets an environment variable value, checking for Vite's VITE_ prefix first.
 * This allows React SDK users with Vite to use VITE_CLERK_PUBLISHABLE_KEY
 * (which Vite exposes client-side) without manual configuration.
 *
 * Note: Empty string values are treated as "not set" and will fall through to
 * the next env var in the chain. This is intentional since empty publishable
 * keys are invalid anyway.
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
 * Retrieves the publishable key from environment variables.
 * Checks VITE_CLERK_PUBLISHABLE_KEY first (for Vite), then CLERK_PUBLISHABLE_KEY.
 *
 * @returns The publishable key or empty string if not found
 */
export const getPublishableKeyFromEnv = (): string => {
  return getEnvVar('CLERK_PUBLISHABLE_KEY');
};

/**
 * Retrieves the sign-in URL from environment variables.
 * Checks VITE_CLERK_SIGN_IN_URL first (for Vite), then CLERK_SIGN_IN_URL.
 *
 * @returns The sign-in URL or empty string if not found
 */
export const getSignInUrlFromEnv = (): string => {
  return getEnvVar('CLERK_SIGN_IN_URL');
};

/**
 * Retrieves the sign-up URL from environment variables.
 * Checks VITE_CLERK_SIGN_UP_URL first (for Vite), then CLERK_SIGN_UP_URL.
 *
 * @returns The sign-up URL or empty string if not found
 */
export const getSignUpUrlFromEnv = (): string => {
  return getEnvVar('CLERK_SIGN_UP_URL');
};

/**
 * Retrieves the sign-in force redirect URL from environment variables.
 * Checks VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL first, then CLERK_SIGN_IN_FORCE_REDIRECT_URL.
 *
 * @returns The sign-in force redirect URL or empty string if not found
 */
export const getSignInForceRedirectUrlFromEnv = (): string => {
  return getEnvVar('CLERK_SIGN_IN_FORCE_REDIRECT_URL');
};

/**
 * Retrieves the sign-up force redirect URL from environment variables.
 * Checks VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL first, then CLERK_SIGN_UP_FORCE_REDIRECT_URL.
 *
 * @returns The sign-up force redirect URL or empty string if not found
 */
export const getSignUpForceRedirectUrlFromEnv = (): string => {
  return getEnvVar('CLERK_SIGN_UP_FORCE_REDIRECT_URL');
};

/**
 * Retrieves the sign-in fallback redirect URL from environment variables.
 * Checks VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL first, then CLERK_SIGN_IN_FALLBACK_REDIRECT_URL.
 *
 * @returns The sign-in fallback redirect URL or empty string if not found
 */
export const getSignInFallbackRedirectUrlFromEnv = (): string => {
  return getEnvVar('CLERK_SIGN_IN_FALLBACK_REDIRECT_URL');
};

/**
 * Retrieves the sign-up fallback redirect URL from environment variables.
 * Checks VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL first, then CLERK_SIGN_UP_FALLBACK_REDIRECT_URL.
 *
 * @returns The sign-up fallback redirect URL or empty string if not found
 */
export const getSignUpFallbackRedirectUrlFromEnv = (): string => {
  return getEnvVar('CLERK_SIGN_UP_FALLBACK_REDIRECT_URL');
};
