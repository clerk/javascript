import type { Clerk, EnvironmentResource } from '@clerk/types';
import { describe, expect, it } from 'vitest';

import type { RedirectContext } from '../redirectRules';
import { evaluateRedirectRules, signInRedirectRules } from '../redirectRules';

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
      () => [null, false] as const,
      () => [{ destination: '/first', reason: 'First rule' }, false] as const,
      () => [{ destination: '/second', reason: 'Second rule' }, false] as const,
    ];

    const context: RedirectContext = {
      clerk: {} as Clerk,
      currentPath: '/sign-in',
      environment: {} as EnvironmentResource,
    };

    const result = evaluateRedirectRules(rules, context);
    expect(result).toEqual({ destination: '/first', reason: 'First rule' });
  });

  it('handles shouldStop flag and returns null', () => {
    const rules = [
      () => [null, true] as const,
      () => [{ destination: '/should-not-reach', reason: 'Should not execute' }, false] as const,
    ];

    const context: RedirectContext = {
      clerk: {} as Clerk,
      currentPath: '/sign-in',
      environment: {} as EnvironmentResource,
    };

    const result = evaluateRedirectRules(rules, context);
    expect(result).toBeNull();
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
        hasInitializedRef: { current: false },
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
        hasInitializedRef: { current: false },
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
        hasInitializedRef: { current: true },
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
        hasInitializedRef: { current: false },
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
        hasInitializedRef: { current: false },
        afterSignInUrl: '/custom',
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      // Should match first rule instead (single session redirect)
      expect(result?.reason).toBe('User already signed in (single session mode)');
    });
  });

  describe('add account flow', () => {
    it('returns skip navigation when __clerk_add_account query param is present', () => {
      const context: RedirectContext = {
        clerk: {
          client: { sessions: [], signedInSessions: [] },
          isSignedIn: false,
        } as any,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
        queryParams: {
          __clerk_add_account: 'true',
        },
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      expect(result).toMatchObject({
        destination: '/sign-in',
        reason: 'User is adding account',
        skipNavigation: true,
        cleanupQueryParams: ['__clerk_add_account'],
      });
    });

    it('does not skip navigation when __clerk_add_account query param is absent', () => {
      const context: RedirectContext = {
        clerk: {
          client: { sessions: [], signedInSessions: [] },
          isSignedIn: false,
        } as any,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
        queryParams: {},
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      // Should evaluate other rules
      expect(result?.reason).not.toBe('User is adding account');
    });
  });
});
