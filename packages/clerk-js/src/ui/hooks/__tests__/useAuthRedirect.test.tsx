import type { Clerk, EnvironmentResource } from '@clerk/types';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RedirectRule } from '../../utils/redirectRules';
import { useAuthRedirect } from '../useAuthRedirect';

// Mock dependencies
vi.mock('@clerk/shared/react', () => ({
  useClerk: vi.fn(),
}));

vi.mock('../../contexts', () => ({
  useEnvironment: vi.fn(),
}));

vi.mock('../../router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../../utils/redirectRules', () => ({
  evaluateRedirectRules: vi.fn(),
  isDevelopmentMode: vi.fn(() => false),
}));

import { useClerk } from '@clerk/shared/react';

import { useEnvironment } from '../../contexts';
import { useRouter } from '../../router';
import { evaluateRedirectRules } from '../../utils/redirectRules';

describe('useAuthRedirect', () => {
  const mockNavigate = vi.fn();
  const mockClerk = {
    isSignedIn: false,
    publishableKey: 'pk_test_xxx',
  } as Clerk;
  const mockEnvironment = {
    authConfig: { singleSessionMode: false },
  } as EnvironmentResource;

  beforeEach(() => {
    vi.clearAllMocks();
    (useClerk as any).mockReturnValue(mockClerk);
    (useEnvironment as any).mockReturnValue(mockEnvironment);
    (useRouter as any).mockReturnValue({
      currentPath: '/sign-in',
      navigate: mockNavigate,
    });
  });

  it('returns isRedirecting: false when no rules match', () => {
    (evaluateRedirectRules as any).mockReturnValue(null);

    const { result } = renderHook(() =>
      useAuthRedirect({
        rules: [],
      }),
    );

    expect(result.current.isRedirecting).toBe(false);
  });

  it('returns isRedirecting: true and calls navigate when rule matches', async () => {
    const mockRule: RedirectRule = vi.fn(() => ({
      destination: '/dashboard',
      reason: 'Test redirect',
    }));

    (evaluateRedirectRules as any).mockReturnValue({
      destination: '/dashboard',
      reason: 'Test redirect',
    });

    const { result } = renderHook(() =>
      useAuthRedirect({
        rules: [mockRule],
      }),
    );

    await waitFor(() => {
      expect(result.current.isRedirecting).toBe(true);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('passes additional context to rules', () => {
    const additionalContext = { afterSignInUrl: '/custom-dashboard' };

    renderHook(() =>
      useAuthRedirect({
        rules: [],
        additionalContext,
      }),
    );

    expect(evaluateRedirectRules).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        clerk: mockClerk,
        currentPath: '/sign-in',
        environment: mockEnvironment,
        afterSignInUrl: '/custom-dashboard',
      }),
      false,
    );
  });

  it('re-evaluates when isSignedIn changes', () => {
    const { rerender } = renderHook(() =>
      useAuthRedirect({
        rules: [],
      }),
    );

    expect(evaluateRedirectRules).toHaveBeenCalledTimes(1);

    // Change isSignedIn
    (useClerk as any).mockReturnValue({
      ...mockClerk,
      isSignedIn: true,
    });

    rerender();

    expect(evaluateRedirectRules).toHaveBeenCalledTimes(2);
  });

  it('re-evaluates when session count changes', () => {
    const { rerender } = renderHook(() =>
      useAuthRedirect({
        rules: [],
      }),
    );

    expect(evaluateRedirectRules).toHaveBeenCalledTimes(1);

    // Change session count
    (useClerk as any).mockReturnValue({
      ...mockClerk,
      client: { sessions: [{ id: '1' }] },
    });

    rerender();

    expect(evaluateRedirectRules).toHaveBeenCalledTimes(2);
  });

  it('re-evaluates when singleSessionMode changes', () => {
    const { rerender } = renderHook(() =>
      useAuthRedirect({
        rules: [],
      }),
    );

    expect(evaluateRedirectRules).toHaveBeenCalledTimes(1);

    // Change singleSessionMode
    (useEnvironment as any).mockReturnValue({
      authConfig: { singleSessionMode: true },
    });

    rerender();

    expect(evaluateRedirectRules).toHaveBeenCalledTimes(2);
  });

  it('re-evaluates when currentPath changes', () => {
    const { rerender } = renderHook(() =>
      useAuthRedirect({
        rules: [],
      }),
    );

    expect(evaluateRedirectRules).toHaveBeenCalledTimes(1);

    // Change currentPath
    (useRouter as any).mockReturnValue({
      currentPath: '/sign-in/factor-one',
      navigate: mockNavigate,
    });

    rerender();

    expect(evaluateRedirectRules).toHaveBeenCalledTimes(2);
  });
});
