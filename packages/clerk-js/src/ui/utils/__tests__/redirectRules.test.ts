import { describe, expect, it } from 'vitest';

import type { Clerk, EnvironmentResource } from '@clerk/types';

import type { RedirectContext } from '../redirectRules';
import { evaluateRedirectRules, signInRedirectRules, signUpRedirectRules } from '../redirectRules';

describe('evaluateRedirectRules', () => {
  it('returns null when no rules match', () => {
    const context: RedirectContext = {
      clerk: { isSignedIn: false } as Clerk,
      currentPath: '/sign-in',
      environment: { authConfig: { singleSessionMode: false } } as EnvironmentResource,
    };

    const result = evaluateRedirectRules([], context);
    expect(result).toBeNull();
  });

  it('returns first matching rule result', () => {
    const rules = [
      () => null,
      () => ({ destination: '/page2', reason: 'Rule 2' }),
      () => ({ destination: '/page3', reason: 'Rule 3' }),
    ];

    const context: RedirectContext = {
      clerk: {} as Clerk,
      currentPath: '/test',
      environment: {} as EnvironmentResource,
    };

    const result = evaluateRedirectRules(rules, context);
    expect(result).toEqual({ destination: '/page2', reason: 'Rule 2' });
  });

  it('evaluates all rules until a match is found', () => {
    const rules = [() => null, () => null, () => ({ destination: '/match', reason: 'Found' })];

    const context: RedirectContext = {
      clerk: {} as Clerk,
      currentPath: '/test',
      environment: {} as EnvironmentResource,
    };

    const result = evaluateRedirectRules(rules, context);
    expect(result).toEqual({ destination: '/match', reason: 'Found' });
  });
});

describe('signInRedirectRules', () => {
  describe('single session mode redirect', () => {
    it('redirects to afterSignInUrl when already signed in', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignInUrl: () => '/default-dashboard',
          isSignedIn: true,
        } as Clerk,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: true },
        } as EnvironmentResource,
        afterSignInUrl: '/custom-dashboard',
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);

      expect(result).toEqual({
        destination: '/custom-dashboard',
        reason: 'User already signed in (single session mode)',
      });
    });

    it('uses clerk.buildAfterSignInUrl when afterSignInUrl not provided', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignInUrl: () => '/default-dashboard',
          isSignedIn: true,
        } as Clerk,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: true },
        } as EnvironmentResource,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);

      expect(result).toEqual({
        destination: '/default-dashboard',
        reason: 'User already signed in (single session mode)',
      });
    });

    it('does not redirect when not signed in', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignInUrl: () => '/dashboard',
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
          buildAfterSignInUrl: () => '/dashboard',
          isSignedIn: true,
        } as Clerk,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      expect(result).not.toEqual(expect.objectContaining({ reason: 'User already signed in (single session mode)' }));
    });
  });

  describe('multi-session mode account switcher redirect', () => {
    it('redirects to /sign-in/choose at root with active sessions', () => {
      const context: RedirectContext = {
        clerk: {
          client: { sessions: [{ id: '1' }, { id: '2' }] },
          isSignedIn: true,
        } as any,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);

      expect(result).toEqual({
        destination: '/sign-in/choose',
        reason: 'Active sessions detected (multi-session mode)',
      });
    });

    it('redirects to /sign-in/choose at root with trailing slash', () => {
      const context: RedirectContext = {
        clerk: {
          client: { sessions: [{ id: '1' }] },
          isSignedIn: true,
        } as any,
        currentPath: '/sign-in/',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);

      expect(result).toEqual({
        destination: '/sign-in/choose',
        reason: 'Active sessions detected (multi-session mode)',
      });
    });

    it('does not redirect at non-root paths', () => {
      const context: RedirectContext = {
        clerk: {
          client: { sessions: [{ id: '1' }] },
          isSignedIn: true,
        } as any,
        currentPath: '/sign-in/factor-one',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
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
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      expect(result).toBeNull();
    });

    it('does not redirect in single-session mode', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignInUrl: () => '/dashboard',
          client: { sessions: [{ id: '1' }] },
          isSignedIn: true,
        } as any,
        currentPath: '/sign-in',
        environment: {
          authConfig: { singleSessionMode: true },
        } as EnvironmentResource,
      };

      const result = evaluateRedirectRules(signInRedirectRules, context);
      // Should match first rule instead (single session redirect)
      expect(result?.reason).toBe('User already signed in (single session mode)');
    });
  });
});

describe('signUpRedirectRules', () => {
  describe('single session mode redirect', () => {
    it('redirects to afterSignUpUrl when already signed in', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignUpUrl: () => '/default-onboarding',
          isSignedIn: true,
        } as Clerk,
        currentPath: '/sign-up',
        environment: {
          authConfig: { singleSessionMode: true },
        } as EnvironmentResource,
        afterSignUpUrl: '/custom-onboarding',
      };

      const result = evaluateRedirectRules(signUpRedirectRules, context);

      expect(result).toEqual({
        destination: '/custom-onboarding',
        reason: 'User already signed in (single session mode)',
      });
    });

    it('uses clerk.buildAfterSignUpUrl when afterSignUpUrl not provided', () => {
      const context: RedirectContext = {
        clerk: {
          buildAfterSignUpUrl: () => '/default-onboarding',
          isSignedIn: true,
        } as Clerk,
        currentPath: '/sign-up',
        environment: {
          authConfig: { singleSessionMode: true },
        } as EnvironmentResource,
      };

      const result = evaluateRedirectRules(signUpRedirectRules, context);

      expect(result).toEqual({
        destination: '/default-onboarding',
        reason: 'User already signed in (single session mode)',
      });
    });
  });

  describe('multi-session mode account switcher redirect', () => {
    it('redirects to /sign-in/choose at root with active sessions', () => {
      const context: RedirectContext = {
        clerk: {
          client: { sessions: [{ id: '1' }] },
          isSignedIn: true,
        } as any,
        currentPath: '/sign-up',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
      };

      const result = evaluateRedirectRules(signUpRedirectRules, context);

      expect(result).toEqual({
        destination: '/sign-in/choose',
        reason: 'Active sessions detected (multi-session mode)',
      });
    });

    it('does not redirect at non-root paths', () => {
      const context: RedirectContext = {
        clerk: {
          client: { sessions: [{ id: '1' }] },
          isSignedIn: true,
        } as any,
        currentPath: '/sign-up/verify',
        environment: {
          authConfig: { singleSessionMode: false },
        } as EnvironmentResource,
      };

      const result = evaluateRedirectRules(signUpRedirectRules, context);
      expect(result).toBeNull();
    });
  });
});
