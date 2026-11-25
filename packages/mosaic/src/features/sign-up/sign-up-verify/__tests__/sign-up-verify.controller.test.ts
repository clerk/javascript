import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSignUpVerifyController } from '../sign-up-verify.controller';

describe('useSignUpVerifyController', () => {
  afterEach(() => vi.useRealTimers());

  it('locks resend for the cooldown, then sends a second code once it ends', async () => {
    vi.useFakeTimers();
    const send = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() =>
      useSignUpVerifyController({
        verification: {
          target: 'alice@example.com',
          needsCode: true,
          send,
          verify: () => Promise.resolve({ type: 'complete' }),
        },
        onNext: () => {},
        isPending: false,
      }),
    );
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(send).toHaveBeenCalledTimes(1);
    expect(result.current.canResend).toBe(false);

    act(() => result.current.onResend());
    expect(send).toHaveBeenCalledTimes(1);

    vi.setSystemTime(Date.now() + 60_000);
    await act(async () => vi.advanceTimersByTimeAsync(1000));

    expect(result.current.canResend).toBe(true);
    act(() => result.current.onResend());
    expect(send).toHaveBeenCalledTimes(2);
  });
});
