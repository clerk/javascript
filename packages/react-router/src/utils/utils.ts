import type { AppLoadContext } from 'react-router';

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
  } catch (_) {
    // This will raise an error in Cloudflare Pages
  }

  return '';
};

/**
 * When React Router is used as a framework, the __reactRouterContext object is populated on window.
 * The isSpaMode will then be set to true if you use https://reactrouter.com/how-to/spa
 *
 * When React Router is used as a library the __reactRouterContext object is not populated on window at all.
 *
 * Therefore, if the __reactRouterContext object is not present on window, we can assume that React Router is being used as a library.
 */
export const isSpaMode = (): boolean => {
  if (typeof window !== 'undefined' && typeof window.__reactRouterContext?.isSpaMode !== 'undefined') {
    return window.__reactRouterContext.isSpaMode;
  }
  return true;
};
