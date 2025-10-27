import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSignInRedirect } from '../useSignInRedirect';

vi.mock('../useRedirectEngine', () => ({
  useRedirectEngine: vi.fn(() => ({ isRedirecting: false })),
}));

vi.mock('../../router', () => ({
  useRouter: vi.fn(() => ({ queryParams: {} })),
}));

vi.mock('../../utils/redirectRules', () => ({
  signInRedirectRules: [],
}));

import { useRouter } from '../../router';
import { useRedirectEngine } from '../useRedirectEngine';

describe('useSignInRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ queryParams: { test: 'value' } });
  });

  it('calls useRedirectEngine with signInRedirectRules', () => {
    renderHook(() =>
      useSignInRedirect({
        afterSignInUrl: '/dashboard',
        organizationTicket: 'test_ticket',
      }),
    );

    expect(useRedirectEngine).toHaveBeenCalledWith({
      rules: [],
      additionalContext: expect.objectContaining({
        afterSignInUrl: '/dashboard',
        organizationTicket: 'test_ticket',
        queryParams: { test: 'value' },
        hasInitializedRef: expect.objectContaining({ current: expect.any(Boolean) }),
      }),
    });
  });

  it('returns isRedirecting from useRedirectEngine', () => {
    (useRedirectEngine as any).mockReturnValue({ isRedirecting: true });

    const { result } = renderHook(() =>
      useSignInRedirect({
        afterSignInUrl: '/dashboard',
      }),
    );

    expect(result.current.isRedirecting).toBe(true);
  });

  it('sets hasInitializedRef to true after first render', () => {
    const { rerender } = renderHook(() =>
      useSignInRedirect({
        afterSignInUrl: '/dashboard',
      }),
    );

    const [[firstCall]] = (useRedirectEngine as any).mock.calls;
    const ref = firstCall.additionalContext.hasInitializedRef;

    // After first render, ref should be true
    rerender();
    expect(ref.current).toBe(true);
  });
});
