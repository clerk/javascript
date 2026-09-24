import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { FieldFeedback } from '../../../components/form/form-submit-error';
import { UserProfileSaveError } from '../user-profile-account-section/user-profile-account-section.types';
import type { UserProfileEditPasswordSubmitResult } from './user-profile-edit-password.controller';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';
import type { UserProfileEditPasswordValue } from './user-profile-password-section.types';

function deferred<T = UserProfileEditPasswordSubmitResult>() {
  let resolve: (result: T) => void = () => {};
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

function renderController(
  onSubmit: (value: UserProfileEditPasswordValue) => Promise<UserProfileEditPasswordSubmitResult> = () =>
    Promise.resolve({ status: 'saved' }),
  requiresCurrentPassword = true,
) {
  return renderHook(() => useUserProfileEditPasswordController({ requiresCurrentPassword, onSubmit }));
}

type Controller = ReturnType<typeof renderController>['result'];

function open(result: Controller) {
  act(() => result.current.onOpenChange(true));
}

function fill(result: Controller, { current = 'old-secret', next = 'new-secret-123' } = {}) {
  act(() => result.current.form.setValue('currentPassword', current));
  act(() => result.current.form.setValue('newPassword', next));
  act(() => result.current.form.setValue('confirmPassword', next));
}

describe('useUserProfileEditPasswordController', () => {
  it('ignores older password feedback and clears it when the editor closes', async () => {
    const older = deferred<FieldFeedback>();
    const newer = deferred<FieldFeedback>();
    const validatePassword = vi.fn().mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    const { result } = renderHook(() =>
      useUserProfileEditPasswordController({
        onSubmit: () => Promise.resolve({ status: 'saved' }),
        validatePassword,
      }),
    );
    open(result);
    fill(result, { next: 'first password' });
    await waitFor(() => expect(validatePassword).toHaveBeenCalledWith('first password'));
    fill(result, { next: 'second password' });
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

  it('can submit while an advisory password check is pending', async () => {
    const check = deferred<FieldFeedback>();
    const validatePassword = vi.fn(() => check.promise);
    const onSubmit = vi.fn(() => Promise.resolve<UserProfileEditPasswordSubmitResult>({ status: 'saved' }));
    const { result } = renderHook(() => useUserProfileEditPasswordController({ onSubmit, validatePassword }));
    open(result);
    fill(result);
    await waitFor(() => expect(validatePassword).toHaveBeenCalled());

    act(() => result.current.form.submit());

    await waitFor(() => expect(result.current.isOpen).toBe(false));
    await act(async () => {
      check.resolve({ type: 'error', message: 'Too short.' });
      await check.promise;
    });
    expect(result.current.passwordFeedback).toBeUndefined();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('ignores dismissal and duplicate saves in the same event as submission', async () => {
    const save = deferred();
    const onSubmit = vi.fn(() => save.promise);
    const { result } = renderController(onSubmit);
    open(result);
    fill(result);

    act(() => {
      result.current.form.submit();
      result.current.onOpenChange(false);
      result.current.form.submit();
    });

    expect(result.current.isOpen).toBe(true);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => {
      save.resolve({ status: 'saved' });
      await save.promise;
    });
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('shows password-rule feedback without blocking an otherwise valid submission', async () => {
    const validatePassword = vi.fn(() =>
      Promise.resolve<FieldFeedback>({
        type: 'warning',
        message: 'Try a longer password.',
      }),
    );
    const onSubmit = vi.fn(() => Promise.resolve<UserProfileEditPasswordSubmitResult>({ status: 'saved' }));
    const { result } = renderHook(() =>
      useUserProfileEditPasswordController({ requiresCurrentPassword: true, onSubmit, validatePassword }),
    );
    open(result);
    fill(result, { next: ' new secret ' });

    await waitFor(() =>
      expect(result.current.passwordFeedback).toEqual({ type: 'warning', message: 'Try a longer password.' }),
    );
    expect(validatePassword).toHaveBeenCalledWith(' new secret ');
    expect(result.current.form.canSubmit).toBe(true);

    act(() => result.current.form.submit());

    await waitFor(() => expect(result.current.isOpen).toBe(false));
    expect(onSubmit).toHaveBeenCalledWith({
      currentPassword: 'old-secret',
      newPassword: ' new secret ',
      signOutOfOtherSessions: true,
    });
  });

  it('returns to editing without losing the draft when the flow cancels verification', async () => {
    const { result } = renderHook(() =>
      useUserProfileEditPasswordController({
        requiresCurrentPassword: true,
        onSubmit: () => Promise.resolve({ status: 'cancelled' }),
      }),
    );
    open(result);
    fill(result);
    act(() => result.current.form.setValue('signOutOfOtherSessions', false));

    act(() => result.current.form.submit());

    await waitFor(() => expect(result.current.form.isSubmitting).toBe(false));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.form.error).toBeUndefined();
    expect(result.current.form.values).toEqual({
      currentPassword: 'old-secret',
      newPassword: 'new-secret-123',
      confirmPassword: 'new-secret-123',
      signOutOfOtherSessions: false,
    });
    expect(result.current.form.canSubmit).toBe(true);
  });

  it('blocks direct submission with an empty confirmation', () => {
    const onSubmit = vi.fn(() => Promise.resolve<UserProfileEditPasswordSubmitResult>({ status: 'saved' }));
    const { result } = renderController(onSubmit);
    open(result);
    fill(result);
    act(() => result.current.form.setValue('confirmPassword', ''));

    act(() => result.current.form.submit());

    expect(result.current.form.canSubmit).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(true);
  });

  it('opens with empty fields and sign-out of other devices on', () => {
    const { result } = renderController();
    expect(result.current.isOpen).toBe(false);

    open(result);

    expect(result.current.isOpen).toBe(true);
    expect(result.current.form.values).toEqual({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      signOutOfOtherSessions: true,
    });
    expect(result.current.form.error).toBeUndefined();
    expect(result.current.form.isSubmitting).toBe(false);
  });

  it('saves the current password alongside the new one when it is required, then closes', async () => {
    const onSubmit = vi.fn(() => Promise.resolve<UserProfileEditPasswordSubmitResult>({ status: 'saved' }));
    const { result } = renderController(onSubmit);
    open(result);
    fill(result);
    act(() => result.current.form.setValue('signOutOfOtherSessions', false));

    act(() => result.current.form.submit());

    expect(result.current.isOpen).toBe(true);
    expect(result.current.form.isSubmitting).toBe(true);
    expect(onSubmit).toHaveBeenCalledWith({
      currentPassword: 'old-secret',
      newPassword: 'new-secret-123',
      signOutOfOtherSessions: false,
    });
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('leaves the current password out when reverification stands in for it', async () => {
    const onSubmit = vi.fn(() => Promise.resolve<UserProfileEditPasswordSubmitResult>({ status: 'saved' }));
    const { result } = renderController(onSubmit, false);
    open(result);
    act(() => result.current.form.setValue('newPassword', 'new-secret-123'));
    act(() => result.current.form.setValue('confirmPassword', 'new-secret-123'));
    expect(result.current.form.canSubmit).toBe(true);

    act(() => result.current.form.submit());

    expect(onSubmit).toHaveBeenCalledWith({
      currentPassword: undefined,
      newPassword: 'new-secret-123',
      signOutOfOtherSessions: true,
    });
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('withholds the save until the halves match and the current password is in', () => {
    const { result } = renderController();
    open(result);
    expect(result.current.form.canSubmit).toBe(false);

    act(() => result.current.form.setValue('newPassword', 'new-secret-123'));
    act(() => result.current.form.setValue('confirmPassword', 'new-secret-123'));
    expect(result.current.form.canSubmit).toBe(false);

    act(() => result.current.form.setValue('currentPassword', 'old-secret'));
    expect(result.current.form.canSubmit).toBe(true);

    act(() => result.current.form.setValue('confirmPassword', 'new-secret-124'));
    expect(result.current.form.canSubmit).toBe(false);
  });

  it('names the mismatch under the confirmation once it has been left', () => {
    const { result } = renderController();
    open(result);
    act(() => result.current.form.setValue('newPassword', 'new-secret-123'));
    act(() => result.current.form.setValue('confirmPassword', 'new-secret-12'));
    expect(result.current.form.fields.confirmPassword.feedback).toBeUndefined();

    act(() => result.current.form.touch('confirmPassword'));
    expect(result.current.form.fields.confirmPassword.feedback).toEqual({
      type: 'error',
      message: "Passwords don't match.",
    });

    act(() => result.current.form.setValue('confirmPassword', 'new-secret-123'));
    expect(result.current.form.fields.confirmPassword.feedback).toBeUndefined();
  });

  it('forgets what was typed when the dialog is cancelled', () => {
    const { result } = renderController();
    open(result);
    fill(result);
    act(() => result.current.form.setValue('signOutOfOtherSessions', false));
    act(() => result.current.form.touch('confirmPassword'));

    act(() => result.current.onOpenChange(false));

    expect(result.current.isOpen).toBe(false);
    open(result);
    expect(result.current.form.values).toEqual({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      signOutOfOtherSessions: true,
    });
    expect(result.current.form.fields.confirmPassword.touched).toBe(false);
  });

  it('starts fresh when opened again after a save', async () => {
    const { result } = renderController();
    open(result);
    fill(result);
    act(() => result.current.form.submit());
    await waitFor(() => expect(result.current.isOpen).toBe(false));

    open(result);

    expect(result.current.form.values.newPassword).toBe('');
  });

  it('stays open while the save runs', async () => {
    const save = deferred();
    const { result } = renderController(() => save.promise);
    open(result);
    fill(result);
    act(() => result.current.form.submit());

    act(() => result.current.onOpenChange(false));

    expect(result.current.isOpen).toBe(true);
    await act(async () => {
      save.resolve({ status: 'saved' });
      await save.promise;
    });
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('keeps what was typed when the save fails, and carries field copy when the rejection names the control', async () => {
    const failure = new UserProfileSaveError('Your password could not be updated.', {
      newPassword: 'Your password must contain 8 or more characters.',
    });
    const { result } = renderController(() => Promise.reject(failure));
    open(result);
    fill(result);
    act(() => result.current.form.submit());

    await waitFor(() => expect(result.current.form.error).toBe('Your password could not be updated.'));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.form.values.newPassword).toBe('new-secret-123');
    expect(result.current.form.fields.newPassword.feedback).toEqual({
      type: 'error',
      message: 'Your password must contain 8 or more characters.',
    });
  });

  it('falls back to generic copy when the rejection is not an Error', async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- a non-Error rejection is the case under test
    const { result } = renderController(() => Promise.reject('nope'));
    open(result);
    fill(result);
    act(() => result.current.form.submit());

    await waitFor(() => expect(result.current.form.error).toBe('Something went wrong. Please try again.'));
  });

  it('keeps a failed save visible next to a fresh mismatch', async () => {
    const { result } = renderController(() => Promise.reject(new Error('Incorrect password.')));
    open(result);
    fill(result);
    act(() => result.current.form.submit());
    await waitFor(() => expect(result.current.form.error).toBe('Incorrect password.'));

    act(() => result.current.form.setValue('confirmPassword', 'new-secret-12'));

    expect(result.current.form.error).toBe('Incorrect password.');
    expect(result.current.form.fields.confirmPassword.feedback).toEqual({
      type: 'error',
      message: "Passwords don't match.",
    });
  });
});
