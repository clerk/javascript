import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserProfileAddPhoneController } from '../user-profile-add-phone.controller';

const sendCode = vi.fn(() => Promise.resolve());
const onCreate = vi.fn(() => Promise.resolve({ sendCode, verifyCode: () => Promise.resolve() }));

async function sendFirstCode() {
  const { result } = renderHook(() => useUserProfileAddPhoneController({ onCreate }));
  act(() => result.current.onOpenChange(true));
  act(() => result.current.onPhoneNumberChange('+18015550100'));
  await act(async () => {
    result.current.onSubmit();
    await vi.advanceTimersByTimeAsync(0);
  });
  return result;
}

async function waitOutCountdown() {
  for (let second = 0; second < 30; second++) {
    await act(async () => vi.advanceTimersByTimeAsync(1000));
  }
}

describe('useUserProfileAddPhoneController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('counts the resend down once a code has been sent', async () => {
    const result = await sendFirstCode();

    expect(result.current.resendSeconds).toBe(30);
    await act(async () => vi.advanceTimersByTimeAsync(1000));
    expect(result.current.resendSeconds).toBe(29);
  });

  it('ignores a resend until the countdown runs out, then restarts it', async () => {
    const result = await sendFirstCode();

    act(() => result.current.onResend());
    expect(sendCode).toHaveBeenCalledTimes(1);

    await waitOutCountdown();
    expect(result.current.resendSeconds).toBe(0);

    await act(async () => {
      result.current.onResend();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(sendCode).toHaveBeenCalledTimes(2);
    expect(result.current.resendSeconds).toBe(30);
  });
});
