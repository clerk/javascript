import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import type { FieldFeedback } from '../../../components/form/form-submit-error';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';

describe('useUserProfileEditPasswordController timing', () => {
  it('shows a validation failure instead of silently dropping it', async () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() =>
        useUserProfileEditPasswordController({
          policy: { mode: 'set' },
          identifier: '',
          onSubmit: () => Promise.resolve(),
          validatePassword: () => Promise.reject(new Error('Failed to load strength checker')),
        }),
      );
      act(() => result.current.onOpenChange(true));
      act(() => result.current.form.setValue('newPassword', 'new password'));
      await act(() => vi.advanceTimersByTimeAsync(350));
      expect(result.current.passwordFeedback).toMatchObject({ type: 'error', message: expect.any(String) });
    } finally {
      vi.useRealTimers();
    }
  });
  it('holds feedback while the next password is being checked', async () => {
    vi.useFakeTimers();
    try {
      const feedback: FieldFeedback = { type: 'warning', message: 'Could be stronger.' };
      const validatePassword = vi.fn(() => Promise.resolve(feedback));
      const { result } = renderHook(() =>
        useUserProfileEditPasswordController({
          policy: { mode: 'set' },
          identifier: '',
          onSubmit: () => Promise.resolve(),
          validatePassword,
        }),
      );
      act(() => result.current.onOpenChange(true));
      act(() => result.current.form.setValue('newPassword', 'first password'));
      await act(() => vi.advanceTimersByTimeAsync(350));
      expect(result.current.passwordFeedback).toEqual(feedback);
      act(() => result.current.form.setValue('newPassword', 'second password'));
      expect(result.current.passwordFeedback).toEqual(feedback);
      act(() => result.current.onOpenChange(false));
      expect(result.current.passwordFeedback).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
  it('debounces changes and cancels pending validation when closed', async () => {
    vi.useFakeTimers();
    try {
      const validatePassword = vi.fn(() => Promise.resolve(undefined));
      const { result } = renderHook(() =>
        useUserProfileEditPasswordController({
          policy: { mode: 'set' },
          identifier: '',
          onSubmit: () => Promise.resolve(),
          validatePassword,
        }),
      );
      act(() => result.current.onOpenChange(true));
      act(() => result.current.form.setValue('newPassword', 'first password'));
      await act(() => vi.advanceTimersByTimeAsync(200));
      expect(validatePassword).not.toHaveBeenCalled();
      act(() => result.current.form.setValue('newPassword', 'latest password'));
      await act(() => vi.advanceTimersByTimeAsync(349));
      expect(validatePassword).not.toHaveBeenCalled();
      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(validatePassword).toHaveBeenCalledExactlyOnceWith('latest password');
      act(() => result.current.form.setValue('newPassword', 'cancelled password'));
      act(() => result.current.onOpenChange(false));
      await act(() => vi.advanceTimersByTimeAsync(350));
      expect(validatePassword).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
  it('ignores older password feedback and clears it when the editor closes', async () => {
    const older = deferred<FieldFeedback>();
    const newer = deferred<FieldFeedback>();
    const validatePassword = vi.fn().mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    const { result } = renderHook(() =>
      useUserProfileEditPasswordController({
        policy: { mode: 'set' },
        identifier: '',
        onSubmit: () => Promise.resolve(),
        validatePassword,
      }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.form.setValue('newPassword', 'first password'));
    await waitFor(() => expect(validatePassword).toHaveBeenCalledWith('first password'));
    act(() => result.current.form.setValue('newPassword', 'second password'));
    await waitFor(() => expect(validatePassword).toHaveBeenCalledWith('second password'));

    await act(async () => {
      newer.resolve({ type: 'success', message: 'Strong password.' });
      await newer.promise;
    });
    await act(async () => {
      older.resolve({ type: 'warning', message: 'Weak password.' });
      await older.promise;
    });

    expect(result.current.passwordFeedback).toEqual({ type: 'success', message: 'Strong password.' });
    act(() => result.current.onOpenChange(false));
    expect(result.current.passwordFeedback).toBeUndefined();
  });

  it('ignores dismissal and duplicate saves in the same event as submission', async () => {
    const save = deferred<void>();
    const onSubmit = vi.fn(() => save.promise);
    const { result } = renderHook(() =>
      useUserProfileEditPasswordController({
        policy: { mode: 'change', requiresCurrentPassword: true },
        identifier: '',
        onSubmit,
      }),
    );
    act(() => result.current.onOpenChange(true));
    act(() => result.current.form.setValue('currentPassword', 'old-secret'));
    act(() => result.current.form.setValue('newPassword', 'new-secret-123'));
    act(() => result.current.form.setValue('confirmPassword', 'new-secret-123'));

    act(() => {
      result.current.form.submit();
      result.current.onOpenChange(false);
      result.current.form.submit();
    });

    expect(result.current.isOpen).toBe(true);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => {
      save.resolve(undefined);
      await save.promise;
    });
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });
});
