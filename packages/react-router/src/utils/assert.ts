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

/**
 * When React Router is used as a framework, the __reactRouterContext object is populated on window.
 * The isSpaMode will then be set to true if you use https://reactrouter.com/how-to/spa or when you deactivate SSR
 *
 * When React Router is used as a library the __reactRouterContext object is not populated on window at all.
 *
 * So in library mode we can't determine if we are in SPA mode or not so we return undefined.
 */
export const isSpaMode = (): boolean | undefined => {
  if (typeof window !== 'undefined' && typeof window.__reactRouterContext?.isSpaMode !== 'undefined') {
    return window.__reactRouterContext.isSpaMode;
  }
  return undefined;
};
