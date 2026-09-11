import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUserProfileAddPhoneController } from './user-profile-add-phone.controller';

describe('useUserProfileAddPhoneController', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps the resend countdown running while verification is pending', async () => {
    vi.useFakeTimers();
    const verification = Promise.withResolvers<void>();
    const { result } = renderHook(() =>
      useUserProfileAddPhoneController({
        onSend: () => Promise.resolve(),
        onVerify: () => verification.promise,
      }),
    );
    act(() => result.current.onOpenChange(true));
    await act(async () => {
      result.current.onSubmit();
      await Promise.resolve();
    });
    act(() => result.current.onSubmit('123456'));
    for (let second = 0; second < 12; second++) {
      await act(async () => vi.advanceTimersByTimeAsync(1000));
    }
    expect(result.current.resendSeconds).toBe(0);
    await act(async () => {
      verification.reject(new Error('Incorrect code'));
      await Promise.resolve();
    });
    expect(result.current.errorMessage).toBe('Incorrect code');
    expect(result.current.resendSeconds).toBe(0);
  });

  it('starts with the supplied phone number', () => {
    const { result } = renderHook(() =>
      useUserProfileAddPhoneController({
        initialPhoneNumber: '+18015558181',
        onSend: () => Promise.resolve(),
        onVerify: () => Promise.resolve(),
      }),
    );
    act(() => result.current.onOpenChange(true));
    expect(result.current.phoneNumber).toBe('+18015558181');
  });

  it('ignores cancellation and duplicate submissions while sending, then resets on reopen', async () => {
    const request = Promise.withResolvers<void>();
    const onSend = vi.fn(() => request.promise);
    const { result } = renderHook(() =>
      useUserProfileAddPhoneController({ onSend, onVerify: () => Promise.resolve() }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onPhoneNumberChange('+18015550100'));
    act(() => {
      result.current.onSubmit();
      result.current.onSubmit();
      result.current.onPhoneNumberChange('+18015550200');
      result.current.onOpenChange(false);
    });
    expect(result.current.open).toBe(true);
    expect(onSend).toHaveBeenCalledExactlyOnceWith('+18015550100');
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    act(() => result.current.onCodeChange('123'));
    act(() => result.current.onOpenChange(false));
    expect(result.current.open).toBe(false);
    act(() => result.current.onOpenChange(true));
    expect(result.current.step).toBe('phone');
    expect(result.current.code).toBe('');
    expect(result.current.resendSeconds).toBe(0);
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('waits before resending, blocks overlapping requests, and restarts the countdown', async () => {
    vi.useFakeTimers();
    const onSend = vi.fn(() => Promise.resolve());
    const onVerify = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useUserProfileAddPhoneController({ onSend, onVerify }));
    act(() => result.current.onOpenChange(true));
    await act(async () => {
      result.current.onSubmit();
      await Promise.resolve();
    });
    expect(result.current.resendSeconds).toBe(12);
    act(() => result.current.onResend());
    expect(onSend).toHaveBeenCalledTimes(1);
    for (let second = 0; second < 12; second++) {
      await act(async () => vi.advanceTimersByTimeAsync(1000));
    }
    expect(result.current.resendSeconds).toBe(0);
    act(() => result.current.onCodeChange('123'));
    await act(async () => {
      result.current.onResend();
      result.current.onResend();
      result.current.onSubmit('123456');
      result.current.onOpenChange(false);
      await Promise.resolve();
    });
    expect(onSend).toHaveBeenCalledTimes(2);
    expect(onVerify).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
    expect(result.current.code).toBe('');
    expect(result.current.resendSeconds).toBe(12);
  });
  it.each(['phone', 'verify'] as const)('keeps the %s input after failure and allows retrying', async step => {
    const operation = vi.fn().mockRejectedValueOnce(new Error('Try again')).mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useUserProfileAddPhoneController({
        onSend: step === 'phone' ? operation : () => Promise.resolve(),
        onVerify: step === 'verify' ? operation : () => Promise.resolve(),
      }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onPhoneNumberChange('+18015550100'));
    act(() => result.current.onSubmit());
    if (step === 'verify') {
      await waitFor(() => expect(result.current.step).toBe('verify'));
      act(() => result.current.onSubmit('000000'));
    }
    await waitFor(() => expect(result.current.errorMessage).toBe('Try again'));
    expect(result.current.isPending).toBe(false);
    expect(result.current.step).toBe(step);
    expect(result.current.phoneNumber).toBe('+18015550100');
    if (step === 'verify') {
      expect(result.current.code).toBe('000000');
    }
    act(() => result.current.onSubmit());
    await waitFor(() => expect(operation).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.errorMessage).toBeUndefined());
  });
  it('sends a code, verifies the submitted code, and closes on success', async () => {
    const onSend = vi.fn(() => Promise.resolve());
    const onVerify = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useUserProfileAddPhoneController({ onSend, onVerify }));

    expect(result.current.open).toBe(false);
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onPhoneNumberChange('+18015550100'));
    act(() => result.current.onSubmit());
    expect(result.current.isPending).toBe(true);
    expect(result.current.open).toBe(true);
    await waitFor(() => expect(result.current.step).toBe('verify'));
    expect(onSend).toHaveBeenCalledExactlyOnceWith('+18015550100');

    act(() => result.current.onSubmit('123456'));
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(onVerify).toHaveBeenCalledExactlyOnceWith('+18015550100', '123456');
  });
});
