import type { ClerkState } from './client/types';
import { invalidClerkStatePropError, noClerkStateError } from './errors';

export function warnForSsr(val: ClerkState | undefined) {
  if (!val || !val.__internal_clerk_state) {
    console.warn(noClerkStateError);
  }
}

export function assertEnvVar(name: any, errorMessage: string): asserts name is string {
  if (!name || typeof name !== 'string') {
    throw new Error(errorMessage);
  }
}

export function assertValidClerkState(val: any): asserts val is ClerkState | undefined {
  if (!val) {
    throw new Error(noClerkStateError);
  }
  if (!!val && !val.__internal_clerk_state) {
    throw new Error(invalidClerkStatePropError);
  }
}

/**
 *
 * Utility function to get env variables across Node and Edge runtimes.
 *
 * @param name
 * @returns
 */
export const getEnvVariable = (name: string): string => {
  // Node envs
  if (typeof process !== 'undefined') {
    return (process.env && process.env[name]) || '';
  }

  // Cloudflare workers
  try {
    // @ts-expect-error
    return globalThis[name];
  } catch (_) {
    // This will raise an error in Cloudflare Pages
  }

  return '';
};
