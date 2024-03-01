import type { AppLoadContext } from '@remix-run/server-runtime';

import type { ClerkState } from '../client/types';
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

type CloudflareEnv = {
  env: Record<string, string>;
};

/**
 *
 * Utility function to get env variables across Node and Edge runtimes.
 *
 * @param name
 * @returns string
 */
export const getEnvVariable = (name: string, context: AppLoadContext | undefined): string => {
  // Remix + Cloudflare pages
  if (typeof (context?.cloudflare as CloudflareEnv)?.env !== 'undefined') {
    return (context?.cloudflare as CloudflareEnv).env[name] || '';
  }

  // Node envs
  if (typeof process !== 'undefined') {
    return (process.env && process.env[name]) || '';
  }

  // Cloudflare pages
  if (typeof context !== 'undefined') {
    const contextEnv = (context as CloudflareEnv)?.env;

    return contextEnv[name] || (context[name] as string) || '';
  }

  // Cloudflare workers
  try {
    return globalThis[name as keyof typeof globalThis];
  } catch (_) {
    // This will raise an error in Cloudflare Pages
  }

  return '';
};
