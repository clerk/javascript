import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useSSO } from '../useSSO';

const mocks = vi.hoisted(() => {
  return {
    useSignIn: vi.fn(),
    useSignUp: vi.fn(),
    openAuthSessionAsync: vi.fn(),
  };
});

vi.mock('@clerk/react/legacy', () => {
  return {
    useSignIn: mocks.useSignIn,
    useSignUp: mocks.useSignUp,
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
    },
  };
});

vi.mock('expo-web-browser', () => {
  return {
    openAuthSessionAsync: mocks.openAuthSessionAsync,
  };
});

// expo-auth-session is intentionally left unmocked: it cannot be require()'d in this environment,
// which exercises the dependency-load failure path (the bug behind #8288). Only the error-path
// test reaches that require(); the other tests return before it, so they are unaffected.

describe('useSSO', () => {
  const mockSignIn = {
    create: vi.fn(),
  };

  const mockSignUp = {
    create: vi.fn(),
    createdSessionId: null,
  };

  const mockSetActive = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useSignIn.mockReturnValue({
      signIn: mockSignIn,
      setActive: mockSetActive,
      isLoaded: true,
    });

    mocks.useSignUp.mockReturnValue({
      signUp: mockSignUp,
      isLoaded: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns the startSSOFlow function', () => {
    const { result } = renderHook(() => useSSO());

    expect(typeof result.current.startSSOFlow).toBe('function');
  });

  test('returns early without starting the flow when Clerk is not loaded', async () => {
    mocks.useSignIn.mockReturnValue({
      signIn: mockSignIn,
      setActive: mockSetActive,
      isLoaded: false,
    });

    const { result } = renderHook(() => useSSO());

    const response = await result.current.startSSOFlow({ strategy: 'oauth_google' });

    expect(mockSignIn.create).not.toHaveBeenCalled();
    expect(mocks.openAuthSessionAsync).not.toHaveBeenCalled();
    expect(response.createdSessionId).toBe(null);
  });

  test('surfaces the underlying error when an auth-session dependency fails to load', async () => {
    const { result } = renderHook(() => useSSO());

    await expect(result.current.startSSOFlow({ strategy: 'oauth_google' })).rejects.toThrow(
      /required for SSO: .+\. If they are not installed/s,
    );
  });
});
