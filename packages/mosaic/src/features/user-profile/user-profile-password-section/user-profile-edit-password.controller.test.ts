import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UserProfileSaveError } from '../user-profile-account-section/user-profile-account-section.types';
import { useUserProfileEditPasswordController } from './user-profile-edit-password.controller';
import type { UserProfileEditPasswordValue } from './user-profile-password-section.types';

function deferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

function renderController(
  onSubmit: (value: UserProfileEditPasswordValue) => Promise<void> = () => Promise.resolve(),
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
    const onSubmit = vi.fn(() => Promise.resolve());
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
    const onSubmit = vi.fn(() => Promise.resolve());
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
      save.resolve();
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
