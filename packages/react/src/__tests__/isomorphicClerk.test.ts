import * as getEnvVariableModule from '@clerk/shared/getEnvVariable';
import type { Resources, UnsubscribeCallback } from '@clerk/shared/types';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { IsomorphicClerk } from '../isomorphicClerk';
import {
  getPublishableKeyFromEnv,
  getSignInFallbackRedirectUrlFromEnv,
  getSignInForceRedirectUrlFromEnv,
  getSignInUrlFromEnv,
  getSignUpFallbackRedirectUrlFromEnv,
  getSignUpForceRedirectUrlFromEnv,
  getSignUpUrlFromEnv,
} from '../utils/envVariables';

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

  describe('getOrCreateInstance with env fallback', () => {
    const mockedGetEnvVariable = vi.mocked(getEnvVariableModule.getEnvVariable);

    beforeEach(() => {
      IsomorphicClerk.clearInstance();
      vi.clearAllMocks();
    });

    afterEach(() => {
      IsomorphicClerk.clearInstance();
    });

    // Note: We use `{} as any` in tests below to simulate the case where publishableKey
    // is not provided (undefined). This is a valid runtime scenario for Vite users who
    // rely on env var fallback, but the type system requires publishableKey to be present.

    it('uses passed-in publishableKey when provided', () => {
      mockedGetEnvVariable.mockReturnValue('');

      const instance = IsomorphicClerk.getOrCreateInstance({
        publishableKey: 'pk_test_explicit',
      });

      expect(instance.publishableKey).toBe('pk_test_explicit');
    });

    it('falls back to VITE_CLERK_PUBLISHABLE_KEY when publishableKey is undefined', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'VITE_CLERK_PUBLISHABLE_KEY') {
          return 'pk_test_from_vite_env';
        }
        return '';
      });

      const instance = IsomorphicClerk.getOrCreateInstance({} as any);

      expect(instance.publishableKey).toBe('pk_test_from_vite_env');
    });

    it('falls back to CLERK_PUBLISHABLE_KEY when VITE_ prefixed not found', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'CLERK_PUBLISHABLE_KEY') {
          return 'pk_test_from_env';
        }
        return '';
      });

      const instance = IsomorphicClerk.getOrCreateInstance({} as any);

      expect(instance.publishableKey).toBe('pk_test_from_env');
    });

    it('does NOT fall back when publishableKey is empty string (framework SDK behavior)', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'VITE_CLERK_PUBLISHABLE_KEY') {
          return 'pk_test_from_vite_env';
        }
        return '';
      });

      // Framework SDKs like Next.js pass empty string when env var is not set
      const instance = IsomorphicClerk.getOrCreateInstance({
        publishableKey: '',
      });

      // Should use the empty string, not fall back to env var
      expect(instance.publishableKey).toBe('');
    });

    it('prioritizes passed-in publishableKey over env vars', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'VITE_CLERK_PUBLISHABLE_KEY') {
          return 'pk_test_from_vite_env';
        }
        if (name === 'CLERK_PUBLISHABLE_KEY') {
          return 'pk_test_from_env';
        }
        return '';
      });

      const instance = IsomorphicClerk.getOrCreateInstance({
        publishableKey: 'pk_test_explicit',
      });

      expect(instance.publishableKey).toBe('pk_test_explicit');
    });

    it('prioritizes VITE_ prefixed env var over non-prefixed', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'VITE_CLERK_PUBLISHABLE_KEY') {
          return 'pk_test_from_vite_env';
        }
        if (name === 'CLERK_PUBLISHABLE_KEY') {
          return 'pk_test_from_env';
        }
        return '';
      });

      const instance = IsomorphicClerk.getOrCreateInstance({} as any);

      expect(instance.publishableKey).toBe('pk_test_from_vite_env');
    });

    it('degrades gracefully when no env vars are set and publishableKey is undefined', () => {
      mockedGetEnvVariable.mockReturnValue('');

      const instance = IsomorphicClerk.getOrCreateInstance({} as any);

      expect(instance.publishableKey).toBe('');
    });
  });
});

describe('getPublishableKeyFromEnv', () => {
  const mockedGetEnvVariable = vi.mocked(getEnvVariableModule.getEnvVariable);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns VITE_CLERK_PUBLISHABLE_KEY when set', () => {
    mockedGetEnvVariable.mockImplementation((name: string) => {
      if (name === 'VITE_CLERK_PUBLISHABLE_KEY') {
        return 'pk_test_vite';
      }
      return '';
    });

    expect(getPublishableKeyFromEnv()).toBe('pk_test_vite');
  });

  it('falls back to CLERK_PUBLISHABLE_KEY when VITE_ prefix not set', () => {
    mockedGetEnvVariable.mockImplementation((name: string) => {
      if (name === 'CLERK_PUBLISHABLE_KEY') {
        return 'pk_test_node';
      }
      return '';
    });

    expect(getPublishableKeyFromEnv()).toBe('pk_test_node');
  });

  it('returns empty string when neither env var is set', () => {
    mockedGetEnvVariable.mockReturnValue('');

    expect(getPublishableKeyFromEnv()).toBe('');
  });
});

describe('URL env var getters', () => {
  const mockedGetEnvVariable = vi.mocked(getEnvVariableModule.getEnvVariable);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSignInUrlFromEnv', () => {
    it('returns VITE_CLERK_SIGN_IN_URL when set', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'VITE_CLERK_SIGN_IN_URL') {
          return '/sign-in-vite';
        }
        return '';
      });

      expect(getSignInUrlFromEnv()).toBe('/sign-in-vite');
    });

    it('falls back to CLERK_SIGN_IN_URL when VITE_ prefix not set', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'CLERK_SIGN_IN_URL') {
          return '/sign-in';
        }
        return '';
      });

      expect(getSignInUrlFromEnv()).toBe('/sign-in');
    });
  });

  describe('getSignUpUrlFromEnv', () => {
    it('returns VITE_CLERK_SIGN_UP_URL when set', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'VITE_CLERK_SIGN_UP_URL') {
          return '/sign-up-vite';
        }
        return '';
      });

      expect(getSignUpUrlFromEnv()).toBe('/sign-up-vite');
    });

    it('falls back to CLERK_SIGN_UP_URL when VITE_ prefix not set', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'CLERK_SIGN_UP_URL') {
          return '/sign-up';
        }
        return '';
      });

      expect(getSignUpUrlFromEnv()).toBe('/sign-up');
    });
  });

  describe('getSignInForceRedirectUrlFromEnv', () => {
    it('returns VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL when set', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL') {
          return '/dashboard';
        }
        return '';
      });

      expect(getSignInForceRedirectUrlFromEnv()).toBe('/dashboard');
    });
  });

  describe('getSignUpForceRedirectUrlFromEnv', () => {
    it('returns VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL when set', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL') {
          return '/onboarding';
        }
        return '';
      });

      expect(getSignUpForceRedirectUrlFromEnv()).toBe('/onboarding');
    });
  });

  describe('getSignInFallbackRedirectUrlFromEnv', () => {
    it('returns VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL when set', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL') {
          return '/home';
        }
        return '';
      });

      expect(getSignInFallbackRedirectUrlFromEnv()).toBe('/home');
    });
  });

  describe('getSignUpFallbackRedirectUrlFromEnv', () => {
    it('returns VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL when set', () => {
      mockedGetEnvVariable.mockImplementation((name: string) => {
        if (name === 'VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL') {
          return '/welcome';
        }
        return '';
      });

      expect(getSignUpFallbackRedirectUrlFromEnv()).toBe('/welcome');
    });
  });
});
