import * as getEnvVariableModule from '@clerk/shared/getEnvVariable';
import type { IsomorphicClerkOptions } from '@clerk/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mergeWithEnv } from '../envVariables';

// Mock getEnvVariable to control env var behavior in tests
vi.mock('@clerk/shared/getEnvVariable', () => ({
  getEnvVariable: vi.fn(() => ''),
}));

describe('mergeWithEnv', () => {
  const mockedGetEnvVariable = vi.mocked(getEnvVariableModule.getEnvVariable);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns passed-in options when all are provided', () => {
    mockedGetEnvVariable.mockReturnValue('should_not_be_used');

    const options: IsomorphicClerkOptions = {
      publishableKey: 'pk_test_explicit',
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
      signInForceRedirectUrl: '/dashboard',
      signUpForceRedirectUrl: '/onboarding',
      signInFallbackRedirectUrl: '/home',
      signUpFallbackRedirectUrl: '/welcome',
    };

    const result = mergeWithEnv(options);

    expect(result.publishableKey).toBe('pk_test_explicit');
    expect(result.signInUrl).toBe('/sign-in');
    expect(result.signUpUrl).toBe('/sign-up');
    expect(result.signInForceRedirectUrl).toBe('/dashboard');
    expect(result.signUpForceRedirectUrl).toBe('/onboarding');
    expect(result.signInFallbackRedirectUrl).toBe('/home');
    expect(result.signUpFallbackRedirectUrl).toBe('/welcome');
  });

  it('falls back to VITE_ prefixed env vars when options are undefined', () => {
    mockedGetEnvVariable.mockImplementation((name: string) => {
      const envVars: Record<string, string> = {
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_vite',
        VITE_CLERK_SIGN_IN_URL: '/vite-sign-in',
        VITE_CLERK_SIGN_UP_URL: '/vite-sign-up',
        VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL: '/vite-dashboard',
        VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL: '/vite-onboarding',
        VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: '/vite-home',
        VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: '/vite-welcome',
      };
      return envVars[name] || '';
    });

    const result = mergeWithEnv({} as any);

    expect(result.publishableKey).toBe('pk_test_vite');
    expect(result.signInUrl).toBe('/vite-sign-in');
    expect(result.signUpUrl).toBe('/vite-sign-up');
    expect(result.signInForceRedirectUrl).toBe('/vite-dashboard');
    expect(result.signUpForceRedirectUrl).toBe('/vite-onboarding');
    expect(result.signInFallbackRedirectUrl).toBe('/vite-home');
    expect(result.signUpFallbackRedirectUrl).toBe('/vite-welcome');
  });

  it('falls back to non-prefixed env vars when VITE_ prefixed not set', () => {
    mockedGetEnvVariable.mockImplementation((name: string) => {
      const envVars: Record<string, string> = {
        CLERK_PUBLISHABLE_KEY: 'pk_test_node',
        CLERK_SIGN_IN_URL: '/node-sign-in',
        CLERK_SIGN_UP_URL: '/node-sign-up',
      };
      return envVars[name] || '';
    });

    const result = mergeWithEnv({} as any);

    expect(result.publishableKey).toBe('pk_test_node');
    expect(result.signInUrl).toBe('/node-sign-in');
    expect(result.signUpUrl).toBe('/node-sign-up');
  });

  it('prioritizes VITE_ prefixed env var over non-prefixed', () => {
    mockedGetEnvVariable.mockImplementation((name: string) => {
      const envVars: Record<string, string> = {
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_vite',
        CLERK_PUBLISHABLE_KEY: 'pk_test_node',
      };
      return envVars[name] || '';
    });

    const result = mergeWithEnv({} as any);

    expect(result.publishableKey).toBe('pk_test_vite');
  });

  it('does NOT fall back when options are empty string (framework SDK behavior)', () => {
    mockedGetEnvVariable.mockImplementation((name: string) => {
      if (name === 'VITE_CLERK_SIGN_IN_URL') {
        return '/vite-sign-in';
      }
      return '';
    });

    const result = mergeWithEnv({
      publishableKey: 'pk_test',
      signInUrl: '',
    });

    // Should preserve empty string, not fall back to env var
    expect(result.signInUrl).toBe('');
  });

  it('returns empty strings when neither options nor env vars are set', () => {
    mockedGetEnvVariable.mockReturnValue('');

    const result = mergeWithEnv({} as any);

    expect(result.publishableKey).toBe('');
    expect(result.signInUrl).toBe('');
    expect(result.signUpUrl).toBe('');
  });

  it('preserves other options that are not env-var backed', () => {
    mockedGetEnvVariable.mockReturnValue('');

    const options: IsomorphicClerkOptions = {
      publishableKey: 'pk_test',
      appearance: { variables: { colorPrimary: 'red' } },
      localization: { signIn: { start: { title: 'Hello' } } },
    };

    const result = mergeWithEnv(options);

    expect(result.appearance).toEqual({ variables: { colorPrimary: 'red' } });
    expect(result.localization).toEqual({ signIn: { start: { title: 'Hello' } } });
  });
});
