import type { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/types';

import { isDevelopmentFromPublishableKey } from '@clerk/shared/keys';

export interface RedirectContext {
  readonly clerk: Clerk;
  readonly currentPath: string;
  readonly environment: EnvironmentResource;
  readonly hasInitialized?: boolean;
  readonly organizationTicket?: string;
  readonly queryParams?: URLSearchParams;
  readonly [key: string]: any;
}

export interface RedirectResult {
  readonly destination: string;
  readonly reason: string;
  readonly skipNavigation?: boolean;
  readonly onRedirect?: () => void;
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

  // Rule 2: Skip redirect if adding account (preserves add account flow)
  ctx => {
    const isAddingAccount = ctx.queryParams?.has('__clerk_add_account');
    if (isAddingAccount) {
      return {
        destination: ctx.currentPath,
        reason: 'User is adding account',
        skipNavigation: true,
        onRedirect: () => {
          // Clean up query param
          ctx.queryParams?.delete('__clerk_add_account');
          const newSearch = ctx.queryParams?.toString();
          const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
          window.history.replaceState({}, '', newUrl);
        },
      };
    }
    return null;
  },

  // Rule 3: Skip redirect if handling organization ticket
  ctx => {
    if (ctx.organizationTicket) {
      return null;
    }
    return null;
  },

  // Rule 4: Multi-session mode - redirect to account switcher with active sessions
  ctx => {
    // Only apply on first initialization to prevent redirect loops
    if (ctx.hasInitialized) {
      return null;
    }

    const isMultiSessionMode = !ctx.environment.authConfig.singleSessionMode;
    const hasActiveSessions = (ctx.clerk.client?.signedInSessions?.length ?? 0) > 0;

    if (hasActiveSessions && isMultiSessionMode) {
      return {
        destination: 'choose',
        reason: 'Active sessions detected (multi-session mode)',
      };
    }
    return null;
  },
];

/**
 * Redirect rules for SignUp component
 *
 * NOTE: Currently not in use. Kept for future implementation.
 * When implementing SignUp redirect logic, follow the same pattern as signInRedirectRules.
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
