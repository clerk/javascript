import type { Clerk, EnvironmentResource } from '@clerk/types';
import type React from 'react';

const debugLogger = {
  info: (..._args: unknown[]) => {},
};

export interface RedirectContext {
  readonly afterSignInUrl?: string;
  readonly afterSignUpUrl?: string;
  readonly clerk: Clerk;
  readonly currentPath: string;
  readonly environment: EnvironmentResource;
  readonly hasInitializedRef?: React.MutableRefObject<boolean>;
  readonly organizationTicket?: string;
  readonly queryParams?: Record<string, string>;
}

export interface RedirectResult {
  readonly destination: string;
  readonly reason: string;
  readonly skipNavigation?: boolean;
  readonly cleanupQueryParams?: string[];
}

export type RedirectRule<T extends Record<string, unknown> = Record<string, unknown>> = (
  context: RedirectContext & T,
) => readonly [RedirectResult | null, boolean];

function isValidRedirectUrl(url: string): boolean {
  try {
    if (url.startsWith('/')) {
      return true;
    }
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Evaluates redirect rules in order, returning the first match.
 *
 * @param rules - Array of redirect rules to evaluate
 * @param context - Context containing clerk instance, path, environment, etc.
 * @returns The first matching redirect result, or null if no rules match
 */
export function evaluateRedirectRules<T extends Record<string, unknown> = Record<string, unknown>>(
  rules: RedirectRule<T>[],
  context: RedirectContext & T,
): RedirectResult | null {
  for (const rule of rules) {
    const [result, shouldStop] = rule(context);

    if (shouldStop) {
      debugLogger.info('Redirect evaluation stopped', { reason: 'Guard triggered' }, 'redirect');
      return null;
    }

    if (result) {
      debugLogger.info(
        'Redirect rule matched',
        {
          destination: result.destination,
          reason: result.reason,
        },
        'redirect',
      );
      return result;
    }
  }
  return null;
}

/**
 * Redirect rules for SignIn component
 */
export const signInRedirectRules: RedirectRule[] = [
  // Guard: Organization ticket flow is handled separately in component
  ctx => {
    if (ctx.organizationTicket) {
      return [null, true];
    }
    return [null, false];
  },

  // Rule 1: Single session mode - user already signed in
  ctx => {
    if (ctx.clerk.isSignedIn && ctx.environment.authConfig.singleSessionMode) {
      let destination = ctx.afterSignInUrl || ctx.clerk.buildAfterSignInUrl();

      if (ctx.afterSignInUrl && !isValidRedirectUrl(ctx.afterSignInUrl)) {
        destination = ctx.clerk.buildAfterSignInUrl();
      }

      return [
        {
          destination,
          reason: 'User already signed in (single session mode)',
        },
        false,
      ];
    }
    return [null, false];
  },

  // Rule 2: Skip redirect if adding account (preserves add account flow)
  ctx => {
    const isAddingAccount = ctx.queryParams?.['__clerk_add_account'];
    if (isAddingAccount) {
      return [
        {
          destination: ctx.currentPath,
          reason: 'User is adding account',
          skipNavigation: true,
          cleanupQueryParams: ['__clerk_add_account'],
        },
        false,
      ];
    }
    return [null, false];
  },

  // Rule 3: Multi-session mode - redirect to account switcher with active sessions
  ctx => {
    if (ctx.hasInitializedRef?.current) {
      return [null, false];
    }

    const isMultiSessionMode = !ctx.environment.authConfig.singleSessionMode;
    const hasActiveSessions = (ctx.clerk.client?.signedInSessions?.length ?? 0) > 0;

    if (hasActiveSessions && isMultiSessionMode) {
      return [
        {
          destination: 'choose',
          reason: 'Active sessions detected (multi-session mode)',
        },
        false,
      ];
    }
    return [null, false];
  },
];

/**
 * Redirect rules for SignUp component
 */
export const signUpRedirectRules: RedirectRule[] = [
  // Rule 1: Single session mode - user already signed in
  ctx => {
    if (ctx.clerk.isSignedIn && ctx.environment.authConfig.singleSessionMode) {
      let destination = ctx.afterSignUpUrl || ctx.clerk.buildAfterSignUpUrl();

      if (ctx.afterSignUpUrl && !isValidRedirectUrl(ctx.afterSignUpUrl)) {
        destination = ctx.clerk.buildAfterSignUpUrl();
      }

      return [
        {
          destination,
          reason: 'User already signed in (single session mode)',
        },
        false,
      ];
    }
    return [null, false];
  },
];
