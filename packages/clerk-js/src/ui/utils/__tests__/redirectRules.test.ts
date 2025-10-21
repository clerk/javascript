import type { Clerk, EnvironmentResource } from '@clerk/types';
import { describe, expect, it } from 'vitest';

import type { RedirectContext } from '../redirectRules';
import { evaluateRedirectRules, signInRedirectRules, StopRedirectEvaluation } from '../redirectRules';

describe('evaluateRedirectRules', () => {
  it('returns null when no rules match', () => {
    const context: RedirectContext = {
      clerk: { isSignedIn: false } as Clerk,
      currentPath: '/sign-in',
      environment: {
        authConfig: { singleSessionMode: true },
      } as EnvironmentResource,
    };

    const result = evaluateRedirectRules([], context);
    expect(result).toBeNull();
  });

  it('returns the first matching rule', () => {
    const rules = [
      () => null,
      () => ({ destination: '/first', reason: 'First rule' }),
      () => ({ destination: '/second', reason: 'Second rule' }),
    ];

    const context: RedirectContext = {
      clerk: {} as Clerk,
      currentPath: '/sign-in',
      environment: {} as EnvironmentResource,
    };

    const result = evaluateRedirectRules(rules, context);
    expect(result).toEqual({ destination: '/first', reason: 'First rule' });
  });

  it('handles StopRedirectEvaluation exception and returns null', () => {
    const rules = [
      () => {
        throw new StopRedirectEvaluation('Guard triggered');
      },
      () => ({ destination: '/should-not-reach', reason: 'Should not execute' }),
    ];

    const context: RedirectContext = {
      clerk: {} as Clerk,
      currentPath: '/sign-in',
      environment: {} as EnvironmentResource,
    };

    const result = evaluateRedirectRules(rules, context);
    expect(result).toBeNull();
  });

  it('re-throws unexpected errors', () => {
    const rules = [
      () => {
        throw new Error('Unexpected error');
      },
    ];

    const context: RedirectContext = {
      clerk: {} as Clerk,
      currentPath: '/sign-in',
      environment: {} as EnvironmentResource,
    };

    expect(() => evaluateRedirectRules(rules, context)).toThrow('Unexpected error');
  });
});

describe('signInRedirectRules', () => {
  describe('organization ticket guard', () => {
    it('stops evaluation when organization ticket is present', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignInUrl: () => '/dashboard',
          isSignedIn: true,
        } as Clerk,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: true },
        } as EnvironmentResource,
        organizationTicket: 'test_ticket',
        afterSignInUrl: '/custom',
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      // Should return null because guard stops evaluation
      expect(result).toBeNull();
    });

    it('continues evaluation when no organization ticket', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignInUrl: () => '/dashboard',
          isSignedIn: true,
        } as Clerk,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: true },
        } as EnvironmentResource,
        afterSignInUrl: '/custom',
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      // Should match single session rule
      expect(result).toEqual({
        destination: '/custom',
        reason: 'User already signed in (single session mode)',
      });
    });
  });

  describe('single session mode redirect', () => {
    it('redirects to afterSignInUrl when already signed in', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignInUrl: () => '/default',
          isSignedIn: true,
        } as Clerk,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: true },
        } as EnvironmentResource,
        afterSignInUrl: '/dashboard',
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);

      expect(result).toEqual({
        destination: '/dashboard',
        reason: 'User already signed in (single session mode)',
      });
    });

    it('uses clerk.buildAfterSignInUrl when afterSignInUrl not provided', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignInUrl: () => '/default',
          isSignedIn: true,
        } as Clerk,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: true },
        } as EnvironmentResource,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);

      expect(result).toEqual({
        destination: '/default',
        reason: 'User already signed in (single session mode)',
      });
    });

    it('does not redirect when not signed in', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignInUrl: () => '/default',
          isSignedIn: false,
        } as Clerk,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: true },
        } as EnvironmentResource,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      expect(result).toBeNull();
    });

    it('does not redirect in multi-session mode', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignInUrl: () => '/default',
          isSignedIn: true,
          client: { signedInSessions: [] },
        } as any,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      // Should not match single session rule, should evaluate other rules
      expect(result).not.toEqual(expect.objectContaining({ reason: 'User already signed in (single session mode)' }));
    });
  });

  describe('multi-session mode account switcher redirect', () => {
    it('redirects to /sign-in/choose at root with active sessions', () => {
      const context: RedirectContext = {
        clerk: {
          client: { sessions: [{ id: '1' }, { id: '2' }], signedInSessions: [{ id: '1' }, { id: '2' }] },
          isSignedIn: true,
        } as any,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
        hasInitialized: false,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);

      expect(result).toEqual({
        destination: 'choose',
        reason: 'Active sessions detected (multi-session mode)',
      });
    });

    it('redirects to /sign-in/choose at root with trailing slash', () => {
      const context: RedirectContext = {
        clerk: {
          client: { sessions: [{ id: '1' }], signedInSessions: [{ id: '1' }] },
          isSignedIn: true,
        } as any,
        currentPath: '/sign-in/',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
        hasInitialized: false,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);

      expect(result).toEqual({
        destination: 'choose',
        reason: 'Active sessions detected (multi-session mode)',
      });
    });

    it('does not redirect when already initialized', () => {
      const context: RedirectContext = {
        clerk: {
          client: { sessions: [{ id: '1' }], signedInSessions: [{ id: '1' }] },
          isSignedIn: true,
        } as any,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
        hasInitialized: true,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      expect(result).toBeNull();
    });

    it('does not redirect when no active sessions', () => {
      const context: RedirectContext = {
        clerk: {
          client: { sessions: [] },
          isSignedIn: false,
        } as any,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
        hasInitialized: false,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      expect(result).toBeNull();
    });
  });

  describe('rule priority', () => {
    it('single session mode takes precedence over multi-session when both conditions met', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignInUrl: () => '/dashboard',
          client: { sessions: [{ id: '1' }], signedInSessions: [{ id: '1' }] },
          isSignedIn: true,
        } as any,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: true },
        } as EnvironmentResource,
        hasInitialized: false,
        afterSignInUrl: '/custom',
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      // Should match first rule instead (single session redirect)
      expect(result?.reason).toBe('User already signed in (single session mode)');
    });
  });
});
