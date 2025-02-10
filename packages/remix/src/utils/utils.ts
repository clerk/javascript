import type { AppLoadContext } from '@remix-run/server-runtime';

import type { ClerkState } from '../client/types';
import { invalidClerkStatePropError, noClerkStateError, publishableKeyMissingErrorInSpaMode } from './errors';

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

export function assertPublishableKeyInSpaMode(key: any): asserts key is string {
  if (!key || typeof key !== 'string') {
    throw new Error(publishableKeyMissingErrorInSpaMode);
  }
}

type CloudflareEnv = { env: Record<string, string> };

// https://remix.run/blog/remix-vite-stable#cloudflare-pages-support
const hasCloudflareProxyContext = (context: any): context is { cloudflare: CloudflareEnv } => {
  return !!context?.cloudflare?.env;
};

const hasCloudflareContext = (context: any): context is CloudflareEnv => {
  return !!context?.env;
};

/**
 *
 * Utility function to get env variables across Node and Edge runtimes.
 *
 * @param name
 * @returns string
 */
export const getEnvVariable = (name: string, context: AppLoadContext | undefined): string => {
  // Node envs
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return process.env[name];
  }

  // Remix + Cloudflare pages
  // if (typeof (context?.cloudflare as CloudflareEnv)?.env !== 'undefined') {
  if (hasCloudflareProxyContext(context)) {
    return context.cloudflare.env[name] || '';
  }

  // Cloudflare
  if (hasCloudflareContext(context)) {
    return context.env[name] || '';
  }

  // Check whether the value exists in the context object directly
  if (context && typeof context[name] === 'string') {
    return context[name];
  }

  // Cloudflare workers
  try {
    return globalThis[name as keyof typeof globalThis];
  } catch {
    // This will raise an error in Cloudflare Pages
  }

  return '';
};

export const inSpaMode = (): boolean => {
  if (typeof window !== 'undefined' && typeof window.__remixContext?.isSpaMode !== 'undefined') {
    return window.__remixContext.isSpaMode;
  }
  return false;
};
