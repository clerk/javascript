import { isDevelopmentFromPublishableKey } from '@clerk/shared/keys';
import type { Clerk, EnvironmentResource } from '@clerk/types';

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
 * Thrown by rules to stop evaluation without redirecting.
 * Used for guard conditions that prevent redirects.
 */
export class StopRedirectEvaluation extends Error {
  constructor(public readonly reason: string) {
    super(reason);
    this.name = 'StopRedirectEvaluation';
  }
}

/**
 * Evaluates redirect rules in order, returning the first match.
 * Rules can throw StopRedirectEvaluation to short-circuit without redirecting.
 *
 * @param rules - Array of redirect rules to evaluate
 * @param context - Context containing clerk instance, path, environment, etc.
 * @param debug - Whether to log debug information (default: false)
 * @returns The first matching redirect result, or null if no rules match
 */
export function evaluateRedirectRules(
  rules: RedirectRule[],
  context: RedirectContext,
  debug = false,
): RedirectResult | null {
  try {
    for (const rule of rules) {
      const result = rule(context);
      if (result) {
        if (debug && isDevelopmentFromPublishableKey(context.clerk.publishableKey)) {
          console.info('[Clerk Redirect]', result.reason, '→', result.destination);
        }
        return result;
      }
    }
    return null;
  } catch (error) {
    if (error instanceof StopRedirectEvaluation) {
      if (debug && isDevelopmentFromPublishableKey(context.clerk.publishableKey)) {
        console.info('[Clerk Redirect]', 'Evaluation stopped:', error.reason);
      }
      return null;
    }
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Redirect rules for SignIn component
 */
export const signInRedirectRules: RedirectRule[] = [
  // Guard: Organization ticket flow is handled separately in component
  ctx => {
    if (ctx.organizationTicket) {
      throw new StopRedirectEvaluation('Organization ticket flow is handled separately');
    }
    return null;
  },

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

  // Rule 3: Multi-session mode - redirect to account switcher with active sessions
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
 * Helper to check if we're in development mode
 */
export function isDevelopmentMode(clerk: Clerk): boolean {
  return isDevelopmentFromPublishableKey(clerk.publishableKey);
}
