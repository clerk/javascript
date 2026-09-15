import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../../machine/createActor';
import { UserProfileSaveError } from '../user-profile-account-section/user-profile-account-section.types';
import {
  userProfileEditPasswordMachine,
  useUserProfileEditPasswordController,
} from './user-profile-edit-password.controller';
import type { UserProfileEditPasswordValue } from './user-profile-password-section.types';

function start(savePassword: (value: UserProfileEditPasswordValue) => Promise<void>, requiresCurrentPassword = true) {
  const actor = createActor(userProfileEditPasswordMachine, {
    context: { savePassword, requiresCurrentPassword },
  }).start();
  actor.send({ type: 'OPEN' });
  return actor;
}

function fill(actor: ReturnType<typeof start>, { current = 'old-secret', next = 'new-secret-123' } = {}) {
  actor.send({ type: 'TYPE', field: 'currentPassword', value: current });
  actor.send({ type: 'TYPE', field: 'newPassword', value: next });
  actor.send({ type: 'TYPE', field: 'confirmPassword', value: next });
}

describe('userProfileEditPasswordMachine', () => {
  it('opens with empty fields and sign-out of other devices on', () => {
    const actor = start(() => Promise.resolve());

    expect(actor.getSnapshot().value).toBe('editing');
    expect(actor.getSnapshot().context).toMatchObject({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      signOutOfOtherSessions: true,
      error: undefined,
    });
  });

  it('saves the current password alongside the new one when it is required', async () => {
    const savePassword = vi.fn(() => Promise.resolve());
    const actor = start(savePassword);
    fill(actor);
    actor.send({ type: 'TOGGLE_SIGN_OUT', value: false });

    actor.send({ type: 'SAVE' });

    expect(actor.getSnapshot().value).toBe('saving');
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('idle'));
    expect(savePassword).toHaveBeenCalledWith({
      currentPassword: 'old-secret',
      newPassword: 'new-secret-123',
      signOutOfOtherSessions: false,
    });
  });

  it('leaves the current password out when reverification stands in for it', async () => {
    const savePassword = vi.fn(() => Promise.resolve());
    const actor = start(savePassword, false);
    actor.send({ type: 'TYPE', field: 'newPassword', value: 'new-secret-123' });
    actor.send({ type: 'TYPE', field: 'confirmPassword', value: 'new-secret-123' });

    actor.send({ type: 'SAVE' });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('idle'));
    expect(savePassword).toHaveBeenCalledWith({
      currentPassword: undefined,
      newPassword: 'new-secret-123',
      signOutOfOtherSessions: true,
    });
  });

  it('forgets what was typed once the save lands, and can be opened again', async () => {
    const actor = start(() => Promise.resolve());
    fill(actor);
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('idle'));
    expect(actor.getSnapshot().status).toBe('active');
    expect(actor.getSnapshot().context.newPassword).toBe('');

    actor.send({ type: 'OPEN' });
    expect(actor.getSnapshot().value).toBe('editing');
  });

  it('forgets what was typed when the dialog is cancelled', () => {
    const actor = start(() => Promise.resolve());
    fill(actor);
    actor.send({ type: 'TOGGLE_SIGN_OUT', value: false });

    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context).toMatchObject({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      signOutOfOtherSessions: true,
    });
  });

  it('keeps what was typed when the save fails, so it can be corrected', async () => {
    const actor = start(() => Promise.reject(new Error('Incorrect password.')));
    fill(actor);
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('editing'));
    expect(actor.getSnapshot().context.newPassword).toBe('new-secret-123');
    expect(actor.getSnapshot().context.error).toEqual({ message: 'Incorrect password.', fields: undefined });
  });

  it('carries field copy through when the rejection names the control', async () => {
    const failure = new UserProfileSaveError('Your password could not be updated.', {
      newPassword: 'Your password must contain 8 or more characters.',
    });
    const actor = start(() => Promise.reject(failure));
    fill(actor);
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() =>
      expect(actor.getSnapshot().context.error?.fields).toEqual({
        newPassword: 'Your password must contain 8 or more characters.',
      }),
    );
  });

  it('falls back to generic copy when the rejection is not an Error', async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- a non-Error rejection is the case under test
    const actor = start(() => Promise.reject('nope'));
    fill(actor);
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() =>
      expect(actor.getSnapshot().context.error?.message).toBe('Something went wrong. Please try again.'),
    );
  });

  it('refuses to save until both halves match', () => {
    const savePassword = vi.fn(() => Promise.resolve());
    const actor = start(savePassword);
    fill(actor);
    actor.send({ type: 'TYPE', field: 'confirmPassword', value: 'new-secret-124' });

    actor.send({ type: 'SAVE' });

    expect(actor.getSnapshot().value).toBe('editing');
    expect(savePassword).not.toHaveBeenCalled();
  });

  it('refuses to save an empty password', () => {
    const savePassword = vi.fn(() => Promise.resolve());
    const actor = start(savePassword);
    actor.send({ type: 'TYPE', field: 'currentPassword', value: 'old-secret' });

    actor.send({ type: 'SAVE' });

    expect(actor.getSnapshot().value).toBe('editing');
    expect(savePassword).not.toHaveBeenCalled();
  });

  it('refuses to save without the current password when it is required', () => {
    const savePassword = vi.fn(() => Promise.resolve());
    const actor = start(savePassword);
    fill(actor, { current: '' });

    actor.send({ type: 'SAVE' });

    expect(actor.getSnapshot().value).toBe('editing');
    expect(savePassword).not.toHaveBeenCalled();
  });
});

describe('useUserProfileEditPasswordController', () => {
  function renderController(onSubmit = () => Promise.resolve(), requiresCurrentPassword = true) {
    return renderHook(() => useUserProfileEditPasswordController({ requiresCurrentPassword, onSubmit }));
  }

  it('holds the dialog open across editing and saving, then closes on success', async () => {
    const { result } = renderController();
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.onOpenChange(true));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.signOutOfOtherSessions).toBe(true);
    expect(result.current.isSaving).toBe(false);

    act(() => result.current.onCurrentPasswordChange('old-secret'));
    act(() => result.current.onNewPasswordChange('new-secret-123'));
    act(() => result.current.onConfirmPasswordChange('new-secret-123'));
    expect(result.current.newPassword).toBe('new-secret-123');

    act(() => result.current.onSubmit());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isSaving).toBe(true);

    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('saves the values it is currently holding', async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    const { result } = renderController(onSubmit);

    act(() => result.current.onOpenChange(true));
    act(() => result.current.onCurrentPasswordChange('old-secret'));
    act(() => result.current.onNewPasswordChange('new-secret-123'));
    act(() => result.current.onConfirmPasswordChange('new-secret-123'));
    act(() => result.current.onSignOutOfOtherSessionsChange(false));
    act(() => result.current.onSubmit());

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        currentPassword: 'old-secret',
        newPassword: 'new-secret-123',
        signOutOfOtherSessions: false,
      }),
    );
  });

  it('withholds the save until the halves match and the current password is in', () => {
    const { result } = renderController();

    act(() => result.current.onOpenChange(true));
    expect(result.current.canSave).toBe(false);

    act(() => result.current.onNewPasswordChange('new-secret-123'));
    act(() => result.current.onConfirmPasswordChange('new-secret-123'));
    expect(result.current.canSave).toBe(false);

    act(() => result.current.onCurrentPasswordChange('old-secret'));
    expect(result.current.canSave).toBe(true);
  });

  it('does not ask for the current password when it is not required', () => {
    const { result } = renderController(() => Promise.resolve(), false);

    act(() => result.current.onOpenChange(true));
    act(() => result.current.onNewPasswordChange('new-secret-123'));
    act(() => result.current.onConfirmPasswordChange('new-secret-123'));

    expect(result.current.canSave).toBe(true);
  });

  it('names the mismatch under the confirmation once it has a value', () => {
    const { result } = renderController();

    act(() => result.current.onOpenChange(true));
    act(() => result.current.onNewPasswordChange('new-secret-123'));
    expect(result.current.error).toBeUndefined();

    act(() => result.current.onConfirmPasswordChange('new-secret-12'));
    expect(result.current.error).toEqual({ fields: { confirmPassword: "Passwords don't match." } });

    act(() => result.current.onConfirmPasswordChange('new-secret-123'));
    expect(result.current.error).toBeUndefined();
  });

  it('keeps a failed save visible next to a fresh mismatch', async () => {
    const { result } = renderController(() => Promise.reject(new Error('Incorrect password.')));

    act(() => result.current.onOpenChange(true));
    act(() => result.current.onCurrentPasswordChange('old-secret'));
    act(() => result.current.onNewPasswordChange('new-secret-123'));
    act(() => result.current.onConfirmPasswordChange('new-secret-123'));
    act(() => result.current.onSubmit());
    await waitFor(() => expect(result.current.error?.message).toBe('Incorrect password.'));

    act(() => result.current.onConfirmPasswordChange('new-secret-12'));

    expect(result.current.error).toEqual({
      message: 'Incorrect password.',
      fields: { confirmPassword: "Passwords don't match." },
    });
  });
});
