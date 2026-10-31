import { ClerkAPIResponseError } from '@clerk/shared/error';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { save } from '../../../../utils/errors';
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

  it('owns which number is being verified until the next add', async () => {
    const { result } = renderHook(() => useUserProfileAddPhoneController({ onCreate }));
    const verifier = { sendCode, verifyCode: () => Promise.resolve() };
    expect(result.current.verifyingId).toBeUndefined();

    act(() => result.current.onVerifyPhone({ id: 'phone_2', value: '+18015550101' }, verifier));
    expect(result.current.verifyingId).toBe('phone_2');
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(result.current.step).toBe('verify');

    act(() => result.current.onVerifyPhone({ id: 'phone_3', value: '+18015550102' }, verifier));
    expect(result.current.verifyingId).toBe('phone_2');
    expect(result.current.phoneNumber).toBe('+18015550101');

    act(() => result.current.onOpenChange(false));
    expect(result.current.open).toBe(false);
    expect(result.current.verifyingId).toBe('phone_2');

    act(() => result.current.onOpenChange(true));
    expect(result.current.verifyingId).toBeUndefined();
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

  it('tells the user when sending a code fails with a Clerk response that carries no errors', async () => {
    const empty = new ClerkAPIResponseError('Server error', { status: 500, data: [] });
    sendCode.mockImplementationOnce(() => save(() => Promise.reject(empty)));

    const result = await sendFirstCode();

    expect(result.current.step).toBe('verify');
    expect(result.current.errorMessage).toBe('Something went wrong. Please try again.');
  });
});
