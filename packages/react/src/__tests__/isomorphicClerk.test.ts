import * as getEnvVariableModule from '@clerk/shared/getEnvVariable';
import type { IsomorphicClerkOptions, Resources, UnsubscribeCallback } from '@clerk/shared/types';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { IsomorphicClerk } from '../isomorphicClerk';
import { mergeWithEnv } from '../utils/envVariables';

// Mock the script loading functions to prevent unhandled promise rejections in tests
vi.mock('@clerk/shared/loadClerkJsScript', () => ({
  loadClerkJsScript: vi.fn().mockResolvedValue(null),
  loadClerkUiScript: vi.fn().mockResolvedValue(null),
}));

// Mock getEnvVariable to control env var behavior in tests
vi.mock('@clerk/shared/getEnvVariable', () => ({
  getEnvVariable: vi.fn(() => ''),
}));

describe('isomorphicClerk', () => {
  beforeAll(() => {
    vi.useFakeTimers();

    // Set up minimal global Clerk objects to prevent errors during initialization
    (global as any).Clerk = {
      load: vi.fn().mockResolvedValue(undefined),
      loaded: false,
    };
    (global as any).__internal_ClerkUiCtor = vi.fn();
  });

  afterAll(() => {
    vi.useRealTimers();
    // Clean up globals
    delete (global as any).Clerk;
    delete (global as any).__internal_ClerkUiCtor;
  });

  it('instantiates a IsomorphicClerk instance', () => {
    expect(() => {
      new IsomorphicClerk({ publishableKey: 'pk_test_XXX' });
    }).not.toThrow();
  });

  it('updates props asynchronously after clerkjs has loaded', async () => {
    const propsHistory: any[] = [];
    const dummyClerkJS = {
      __internal_updateProps: (props: any) => propsHistory.push(props),
    };

    const isomorphicClerk = new IsomorphicClerk({ publishableKey: 'pk_test_XXX' });
    (isomorphicClerk as any).clerkjs = dummyClerkJS as any;

    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'dark' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'light' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'purple' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'yellow' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'red' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'blue' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'green' } });
    expect(propsHistory).toEqual([]);

    vi.spyOn(isomorphicClerk, 'loaded', 'get').mockReturnValue(true);
    isomorphicClerk.emitLoaded();
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'white' } });
    await vi.runAllTimersAsync();

    expect(propsHistory).toEqual([
      { appearance: { theme: 'dark' } },
      { appearance: { theme: 'light' } },
      { appearance: { theme: 'purple' } },
      { appearance: { theme: 'yellow' } },
      { appearance: { theme: 'red' } },
      { appearance: { theme: 'blue' } },
      { appearance: { theme: 'green' } },
      { appearance: { theme: 'white' } },
    ]);
  });

  it('handles multiple resource listeners', async () => {
    const listenerCallHistory: Array<Resources> = [];
    const addedListeners: Map<(payload: Resources) => void, { unsubscribe: UnsubscribeCallback }> = new Map();

    const dummyClerkJS = {
      addListener: (listener: (payload: Resources) => void) => {
        const unsubscribe = () => {
          addedListeners.delete(listener);
        };
        addedListeners.set(listener, { unsubscribe });
        return unsubscribe;
      },
    };

    const isomorphicClerk = new IsomorphicClerk({ publishableKey: 'pk_test_xxx' });
    (isomorphicClerk as any).clerkjs = dummyClerkJS as any;

    const unsubscribe1 = isomorphicClerk.addListener(payload => listenerCallHistory.push(payload));
    const unsubscribe2 = isomorphicClerk.addListener(payload => listenerCallHistory.push(payload));

    // Unsubscribe one listener before ClerkJS is loaded
    unsubscribe1();

    vi.spyOn(isomorphicClerk, 'loaded', 'get').mockReturnValue(true);
    isomorphicClerk.emitLoaded();
    const unsubscribe3 = isomorphicClerk.addListener(payload => listenerCallHistory.push(payload));

    // Simulate ClerkJS triggering the listeners
    const mockPayload = {
      user: { id: 'user_xxx' },
      session: { id: 'sess_xxx' },
      client: { id: 'client_xxx' },
      organization: undefined,
    } as Resources;
    addedListeners.forEach((_, listener) => listener(mockPayload));

    expect(listenerCallHistory).toEqual([mockPayload, mockPayload]);
    expect(listenerCallHistory.length).toBe(2);

    // Unsubscribe all remaining listeners
    unsubscribe2();
    unsubscribe3();
    listenerCallHistory.length = 0;
    addedListeners.forEach((_, listener) => listener(mockPayload));

    expect(listenerCallHistory).toEqual([]);
    expect(listenerCallHistory.length).toBe(0);
  });
});

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
});
