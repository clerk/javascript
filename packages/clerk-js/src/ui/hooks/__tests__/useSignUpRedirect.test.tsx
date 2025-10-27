import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSignUpRedirect } from '../useSignUpRedirect';

vi.mock('../useRedirectEngine', () => ({
  useRedirectEngine: vi.fn(() => ({ isRedirecting: false })),
}));

vi.mock('../../router', () => ({
  useRouter: vi.fn(() => ({ queryParams: {} })),
}));

vi.mock('../../utils/redirectRules', () => ({
  signUpRedirectRules: [],
}));

import { useRouter } from '../../router';
import { useRedirectEngine } from '../useRedirectEngine';

describe('useSignUpRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ queryParams: { test: 'value' } });
  });

  it('calls useRedirectEngine with signUpRedirectRules', () => {
    renderHook(() =>
      useSignUpRedirect({
        afterSignUpUrl: '/onboarding',
      }),
    );

    expect(useRedirectEngine).toHaveBeenCalledWith({
      rules: [],
      additionalContext: expect.objectContaining({
        afterSignUpUrl: '/onboarding',
        queryParams: { test: 'value' },
      }),
    });
  });

  it('returns isRedirecting from useRedirectEngine', () => {
    (useRedirectEngine as any).mockReturnValue({ isRedirecting: true });

    const { result } = renderHook(() =>
      useSignUpRedirect({
        afterSignUpUrl: '/onboarding',
      }),
    );

    expect(result.current.isRedirecting).toBe(true);
  });

  it('does not include hasInitializedRef for SignUp flow', () => {
    renderHook(() =>
      useSignUpRedirect({
        afterSignUpUrl: '/onboarding',
      }),
    );

    const [[call]] = (useRedirectEngine as any).mock.calls;
    expect(call.additionalContext.hasInitializedRef).toBeUndefined();
  });
});
