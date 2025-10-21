import type { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/types';

import { isDevelopmentFromPublishableKey } from '@clerk/shared/keys';

export interface RedirectContext {
  readonly clerk: Clerk;
  readonly currentPath: string;
  readonly environment: EnvironmentResource;
  readonly [key: string]: any;
}

export interface RedirectResult {
  readonly destination: string;
  readonly reason: string;
}

export type RedirectRule = (context: RedirectContext) => RedirectResult | null;

/**
 * Evaluates redirect rules in order, returning the first match
 */
export function evaluateRedirectRules(
  rules: RedirectRule[],
  context: RedirectContext,
  debug = false,
): RedirectResult | null {
  for (const rule of rules) {
    const result = rule(context);
    if (result) {
      if (debug) {
        console.info('[Clerk Redirect]', result.reason, '→', result.destination);
      }
      return result;
    }
  }
  return null;
}

/**
 * Redirect rules for SignIn component
 */
export const signInRedirectRules: RedirectRule[] = [
  // Rule 1: Single session mode - user already signed in
  ctx => {
    if (ctx.clerk.isSignedIn && ctx.environment.authConfig.singleSessionMode) {
      const destination = ctx.afterSignInUrl || ctx.clerk.buildAfterSignInUrl();
      return {
        destination,
        reason: 'User already signed in (single session mode)',
      };
    }
    return null;
  },

  // Rule 2: Multi-session mode - redirect to account switcher at root with active sessions
  ctx => {
    const isRoot = ctx.currentPath === '/sign-in' || ctx.currentPath === '/sign-in/';
    const hasActiveSessions = (ctx.clerk.client?.sessions?.length ?? 0) > 0;

    if (ctx.clerk.isSignedIn && !ctx.environment.authConfig.singleSessionMode && isRoot && hasActiveSessions) {
      return {
        destination: '/sign-in/choose',
        reason: 'Active sessions detected (multi-session mode)',
      };
    }
    return null;
  },
];

/**
 * Redirect rules for SignUp component
 */
export const signUpRedirectRules: RedirectRule[] = [
  // Rule 1: Single session mode - user already signed in
  ctx => {
    if (ctx.clerk.isSignedIn && ctx.environment.authConfig.singleSessionMode) {
      const destination = ctx.afterSignUpUrl || ctx.clerk.buildAfterSignUpUrl();
      return {
        destination,
        reason: 'User already signed in (single session mode)',
      };
    }
    return null;
  },

  // Rule 2: Multi-session mode - redirect to account switcher at root with active sessions
  ctx => {
    const isRoot = ctx.currentPath === '/sign-up' || ctx.currentPath === '/sign-up/';
    const hasActiveSessions = (ctx.clerk.client?.sessions?.length ?? 0) > 0;

    if (ctx.clerk.isSignedIn && !ctx.environment.authConfig.singleSessionMode && isRoot && hasActiveSessions) {
      return {
        destination: '/sign-in/choose',
        reason: 'Active sessions detected (multi-session mode)',
      };
    }
    return null;
  },
];

/**
 * Helper to check if we're in development mode
 */
export function isDevelopmentMode(clerk: Clerk): boolean {
  return isDevelopmentFromPublishableKey(clerk.publishableKey);
}

