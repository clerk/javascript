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

  it('returns passed-in publishableKey when provided', () => {
    mockedGetEnvVariable.mockReturnValue('should_not_be_used');

    const options: IsomorphicClerkOptions = {
      publishableKey: 'pk_test_explicit',
    };

    const result = mergeWithEnv(options);

    expect(result.publishableKey).toBe('pk_test_explicit');
  });

  it('falls back to VITE_CLERK_PUBLISHABLE_KEY env var when option is undefined', () => {
    mockedGetEnvVariable.mockImplementation((name: string) => {
      if (name === 'VITE_CLERK_PUBLISHABLE_KEY') {
        return 'pk_test_vite';
      }
      return '';
    });

    const result = mergeWithEnv({} as any);

    expect(result.publishableKey).toBe('pk_test_vite');
  });

  it('falls back to CLERK_PUBLISHABLE_KEY when VITE_ prefixed not set', () => {
    mockedGetEnvVariable.mockImplementation((name: string) => {
      if (name === 'CLERK_PUBLISHABLE_KEY') {
        return 'pk_test_node';
      }
      return '';
    });

    const result = mergeWithEnv({} as any);

    expect(result.publishableKey).toBe('pk_test_node');
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

  it('does NOT fall back when publishableKey is empty string (framework SDK behavior)', () => {
    mockedGetEnvVariable.mockReturnValue('pk_test_vite');

    const result = mergeWithEnv({
      publishableKey: '',
    });

    // Should preserve empty string, not fall back to env var
    expect(result.publishableKey).toBe('');
  });

  it('returns undefined publishableKey when neither option nor env var is set', () => {
    mockedGetEnvVariable.mockReturnValue('');

    const result = mergeWithEnv({} as any);

    // When env var is not set, we don't add the property
    expect(result.publishableKey).toBeUndefined();
  });

  it('preserves other options that are not env-var backed', () => {
    mockedGetEnvVariable.mockReturnValue('');

    const options: IsomorphicClerkOptions = {
      publishableKey: 'pk_test',
      appearance: { variables: { colorPrimary: 'red' } },
      localization: { signIn: { start: { title: 'Hello' } } },
      signInUrl: '/custom-sign-in',
      signUpUrl: '/custom-sign-up',
    };

    const result = mergeWithEnv(options);

    expect(result.publishableKey).toBe('pk_test');
    expect(result.appearance).toEqual({ variables: { colorPrimary: 'red' } });
    expect(result.localization).toEqual({ signIn: { start: { title: 'Hello' } } });
    expect(result.signInUrl).toBe('/custom-sign-in');
    expect(result.signUpUrl).toBe('/custom-sign-up');
  });
});
