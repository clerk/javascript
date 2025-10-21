import type { Clerk, EnvironmentResource } from '@clerk/types';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('../../utils/redirectRules', async () => {
  const actual = await vi.importActual('../../utils/redirectRules');
  return {
    ...actual,
    evaluateRedirectRules: vi.fn(),
    isDevelopmentMode: vi.fn(() => false),
  };
});

import { useClerk } from '@clerk/shared/react';

import { useEnvironment } from '../../contexts';
import { useRouter } from '../../router';
import { evaluateRedirectRules } from '../../utils/redirectRules';

describe('useAuthRedirect', () => {
  const mockNavigate = vi.fn();
  const mockClerk = {
    isSignedIn: false,
    client: { sessions: [], signedInSessions: [] },
  } as unknown as Clerk;
  const mockEnvironment = {
    authConfig: { singleSessionMode: true },
  } as EnvironmentResource;

  beforeEach(() => {
    vi.clearAllMocks();
    (useClerk as any).mockReturnValue(mockClerk);
    (useEnvironment as any).mockReturnValue(mockEnvironment);
    (useRouter as any).mockReturnValue({ navigate: mockNavigate, currentPath: '/sign-in' });
    (evaluateRedirectRules as any).mockReturnValue(null);
  });

  it('returns isRedirecting false when no redirect needed', () => {
    const { result } = renderHook(() =>
      useAuthRedirect({
        rules: [],
        additionalContext: {},
      }),
    );

    expect(result.current.isRedirecting).toBe(false);
  });

  it('navigates when redirect rule matches', async () => {
    (evaluateRedirectRules as any).mockReturnValue({
      destination: '/dashboard',
      reason: 'Test redirect',
    });

    const { result } = renderHook(() =>
      useAuthRedirect({
        rules: [],
        additionalContext: {},
      }),
    );

    await waitFor(() => {
      expect(result.current.isRedirecting).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('does not navigate when skipNavigation is true', async () => {
    (evaluateRedirectRules as any).mockReturnValue({
      destination: '/current',
      reason: 'Side effect only',
      skipNavigation: true,
    });

    renderHook(() =>
      useAuthRedirect({
        rules: [],
        additionalContext: {},
      }),
    );

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('executes onRedirect callback when provided', async () => {
    const onRedirect = vi.fn();
    (evaluateRedirectRules as any).mockReturnValue({
      destination: '/dashboard',
      reason: 'Test redirect',
      onRedirect,
    });

    renderHook(() =>
      useAuthRedirect({
        rules: [],
        additionalContext: {},
      }),
    );

    await waitFor(() => {
      expect(onRedirect).toHaveBeenCalled();
    });
  });

  it('passes additional context to evaluateRedirectRules', async () => {
    const additionalContext = {
      afterSignInUrl: '/custom',
      organizationTicket: 'test_ticket',
    };

    renderHook(() =>
      useAuthRedirect({
        rules: [],
        additionalContext,
      }),
    );

    await waitFor(() => {
      expect(evaluateRedirectRules).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          clerk: mockClerk,
          currentPath: '/sign-in',
          environment: mockEnvironment,
          ...additionalContext,
        }),
        false,
      );
    });
  });

  it('re-evaluates when auth state changes', async () => {
    const { rerender } = renderHook(() =>
      useAuthRedirect({
        rules: [],
        additionalContext: {},
      }),
    );

    expect(evaluateRedirectRules).toHaveBeenCalledTimes(1);

    // Change auth state
    (useClerk as any).mockReturnValue({
      ...mockClerk,
      isSignedIn: true,
    });

    rerender();

    await waitFor(() => {
      expect(evaluateRedirectRules).toHaveBeenCalledTimes(2);
    });
  });

  it('handles type-safe additional context', () => {
    interface CustomContext {
      customField: string;
      optionalField?: number;
    }

    const { result } = renderHook(() =>
      useAuthRedirect<CustomContext>({
        rules: [],
        additionalContext: {
          customField: 'test',
          optionalField: 42,
        },
      }),
    );

    expect(result.current.isRedirecting).toBe(false);
  });
});
