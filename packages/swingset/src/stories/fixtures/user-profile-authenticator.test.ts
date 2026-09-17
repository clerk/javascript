import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserProfileAuthenticatorPreparationFixture } from './user-profile-authenticator';

describe('Authenticator card fixture', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts with retry feedback and cancels pending preparation when dismissed', async () => {
    const { result } = renderHook(() => useUserProfileAuthenticatorPreparationFixture({ initialOpen: true }));
    expect(result.current.open).toBe(true);
    expect(result.current.setupErrorMessage).toContain('Unable to prepare');
    act(() => result.current.onRetry());
    expect(result.current.setupErrorMessage).toBeUndefined();
    expect(result.current.setup).toBeUndefined();
    act(() => result.current.onOpenChange(false));
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(result.current.open).toBe(false);
    expect(result.current.setup).toBeUndefined();

    act(() => result.current.onOpenChange(true));
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(result.current.setupErrorMessage).toContain('Unable to prepare');
    act(() => result.current.onRetry());
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(result.current.setup?.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(result.current.setupErrorMessage).toBeUndefined();
  });
});
