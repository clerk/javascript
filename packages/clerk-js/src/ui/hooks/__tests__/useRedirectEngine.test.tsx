import type { Clerk, EnvironmentResource } from '@clerk/types';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRedirectEngine } from '../useRedirectEngine';

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
  };
});

import { useClerk } from '@clerk/shared/react';

import { useEnvironment } from '../../contexts';
import { useRouter } from '../../router';
import { evaluateRedirectRules } from '../../utils/redirectRules';

describe('useRedirectEngine', () => {
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
      useRedirectEngine({
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
      useRedirectEngine({
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
      useRedirectEngine({
        rules: [],
        additionalContext: {},
      }),
    );

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('handles cleanupQueryParams declaratively', async () => {
    const mockReplaceState = vi.fn();
    Object.defineProperty(window, 'history', {
      value: { replaceState: mockReplaceState },
      writable: true,
    });
    Object.defineProperty(window, 'location', {
      value: { search: '?__clerk_add_account=true&other=value', pathname: '/sign-in' },
      writable: true,
    });

    (evaluateRedirectRules as any).mockReturnValue({
      destination: '/sign-in',
      reason: 'Cleanup params',
      skipNavigation: true,
      cleanupQueryParams: ['__clerk_add_account'],
    });

    renderHook(() =>
      useRedirectEngine({
        rules: [],
        additionalContext: {},
      }),
    );

    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith({}, '', '/sign-in?other=value');
    });
  });

  it('passes additional context to evaluateRedirectRules', async () => {
    const additionalContext = {
      afterSignInUrl: '/custom',
      organizationTicket: 'test_ticket',
    };

    renderHook(() =>
      useRedirectEngine({
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
      );
    });
  });

  it('re-evaluates when auth state changes', async () => {
    const { rerender } = renderHook(() =>
      useRedirectEngine({
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
      useRedirectEngine<CustomContext>({
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
