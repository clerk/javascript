import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { clerkApiError } from '../../../__tests__/clerk-errors';
import { useReverificationController } from '../reverification.controller';
import type { ReverificationActiveModel, ReverificationModel } from '../reverification.model';
import type { ReverificationMethod, ReverificationResult } from '../reverification.types';

const email: ReverificationMethod = {
  id: 'email',
  stage: 'first',
  strategy: 'email_code',
  emailAddressId: 'idn_email',
  identifier: 'alice@example.com',
};
const password: ReverificationMethod = { id: 'password', stage: 'first', strategy: 'password' };
const challenge: ReverificationResult = {
  status: 'needs_first_factor',
  methods: [email, password],
  startingMethod: email,
};

async function preparing() {
  const preparation = deferred<void>();
  const model: ReverificationActiveModel = {
    status: 'active',
    supportEmail: '',
    start: vi.fn().mockResolvedValue(challenge),
    prepare: vi.fn().mockReturnValueOnce(preparation.promise).mockResolvedValue(undefined),
    attempt: vi.fn().mockResolvedValue({ ...challenge, status: 'complete' }),
    finish: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn(),
  };
  const hook = renderHook((props: ReverificationModel) => useReverificationController(props), {
    initialProps: model,
  });
  const ready = () => {
    const controller = hook.result.current;
    if (controller.status !== 'ready') {
      throw new Error(`Expected ready, received ${controller.status}`);
    }
    return controller;
  };
  await waitFor(() => expect(model.prepare).toHaveBeenCalledTimes(1));
  return { ...hook, model, preparation, ready };
}

describe('OTP preparation while navigating', () => {
  it.each(['method-picker', 'help'] as const)(
    'retains failure while viewing %s and allows an immediate retry',
    async step => {
      const { model, preparation, ready } = await preparing();
      act(() => ready().onShowMethods());
      if (step === 'help') {
        act(() => ready().onShowHelp());
      }
      await act(() => preparation.reject(clerkApiError('preparation_failed', 'Could not send your code')));
      expect(ready().step).toBe(step);
      if (step === 'help') {
        act(() => ready().onBack());
        expect(ready().step).toBe('method-picker');
      }
      act(() => ready().onBack());
      expect(ready().step).toBe('otp');
      expect(ready().errorMessage).toBe('Could not send your code');
      expect(ready().canResend).toBe(true);
      await act(() => ready().onResend());
      expect(model.prepare).toHaveBeenCalledTimes(2);
      expect(ready().errorMessage).toBeUndefined();
      expect(ready().canResend).toBe(false);
    },
  );

  it('keeps a successful send and its cooldown when returning from the picker', async () => {
    const { model, preparation, ready } = await preparing();
    act(() => ready().onShowMethods());
    await act(() => preparation.resolve());
    expect(ready().step).toBe('method-picker');
    act(() => ready().onBack());
    expect(ready().step).toBe('otp');
    expect(ready().errorMessage).toBeUndefined();
    expect(ready().canResend).toBe(false);
    act(() => ready().onResend());
    expect(model.prepare).toHaveBeenCalledTimes(1);
  });

  it.each(['success', 'failure'] as const)(
    'holds a submit after Back until preparation settles with %s',
    async outcome => {
      const { model, preparation, ready } = await preparing();
      act(() => ready().onShowMethods());
      act(() => ready().onBack());
      act(() => ready().onValueChange('123456'));
      act(() => ready().onSubmit());
      expect(model.attempt).not.toHaveBeenCalled();
      expect(model.prepare).toHaveBeenCalledTimes(1);
      if (outcome === 'failure') {
        await act(() => preparation.reject(clerkApiError('preparation_failed', 'Could not send your code')));
        expect(model.attempt).not.toHaveBeenCalled();
        expect(ready().errorMessage).toBe('Could not send your code');
        expect(ready().canResend).toBe(true);
      } else {
        await act(() => preparation.resolve());
        expect(model.attempt).toHaveBeenCalledExactlyOnceWith(email, '123456');
      }
    },
  );

  it('returns from help to the pending factor without sending another code', async () => {
    const { model, preparation, ready } = await preparing();
    act(() => ready().onShowHelp());
    expect(ready().step).toBe('help');
    act(() => ready().onBack());
    expect(ready().step).toBe('otp');
    await act(() => preparation.reject(clerkApiError('preparation_failed', 'Could not send your code')));
    expect(ready().errorMessage).toBe('Could not send your code');
    expect(ready().canResend).toBe(true);
    expect(model.prepare).toHaveBeenCalledTimes(1);
  });

  it('discards a queued submit when opening the picker', async () => {
    const { model, preparation, ready } = await preparing();
    act(() => ready().onValueChange('123456'));
    act(() => ready().onSubmit());
    act(() => ready().onShowMethods());
    await act(() => preparation.resolve());
    expect(ready().step).toBe('method-picker');
    expect(model.attempt).not.toHaveBeenCalled();
    act(() => ready().onBack());
    expect(ready().value).toBe('123456');
    expect(model.prepare).toHaveBeenCalledTimes(1);
  });

  it('ignores an old failure after selecting another method', async () => {
    const { preparation, ready } = await preparing();
    act(() => ready().onShowMethods());
    act(() => ready().onSelectMethod(password.id));
    await act(() => preparation.reject(clerkApiError('preparation_failed', 'Old failure')));
    expect(ready().step).toBe('password');
    expect(ready().errorMessage).toBeUndefined();
  });

  it('ignores a cancelled preparation after starting another run', async () => {
    const { model, preparation, ready, rerender } = await preparing();
    act(() => ready().onShowMethods());
    rerender({ status: 'inactive' });
    rerender(model);
    await waitFor(() => expect(model.prepare).toHaveBeenCalledTimes(2));
    await act(() => preparation.reject(clerkApiError('preparation_failed', 'Old failure')));
    expect(ready().step).toBe('otp');
    expect(ready().errorMessage).toBeUndefined();
    expect(ready().canResend).toBe(false);
  });
});
