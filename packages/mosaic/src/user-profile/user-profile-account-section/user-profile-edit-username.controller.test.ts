import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { UserProfileSaveError } from './user-profile-account-section.types';
import {
  userProfileEditUsernameMachine,
  useUserProfileEditUsernameController,
} from './user-profile-edit-username.controller';

function start(saveUsername: () => Promise<void>, savedUsername = 'prestonxyz') {
  const actor = createActor(userProfileEditUsernameMachine, { context: { saveUsername, savedUsername } }).start();
  actor.send({ type: 'OPEN' });
  return actor;
}

describe('userProfileEditUsernameMachine', () => {
  it('seeds the field from the saved username on open', () => {
    const actor = start(() => Promise.resolve());

    expect(actor.getSnapshot().value).toBe('editing');
    expect(actor.getSnapshot().context.username).toBe('prestonxyz');
  });

  it('returns to idle when the save lands, and can be opened again', async () => {
    const actor = start(() => Promise.resolve());
    actor.send({ type: 'TYPE', value: 'preston' });
    actor.send({ type: 'SAVE' });
    expect(actor.getSnapshot().value).toBe('saving');

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('idle'));
    expect(actor.getSnapshot().status).toBe('active');

    actor.send({ type: 'OPEN' });
    expect(actor.getSnapshot().value).toBe('editing');
  });

  it('re-seeds from the saved username on the next open, dropping what was typed', () => {
    const actor = start(() => Promise.resolve());
    actor.send({ type: 'TYPE', value: 'ada' });
    actor.send({ type: 'CANCEL' });

    actor.send({ type: 'OPEN' });

    expect(actor.getSnapshot().context.username).toBe('prestonxyz');
  });

  it('keeps what was typed when the save fails, so it can be corrected', async () => {
    const actor = start(() => Promise.reject(new Error('That username is taken.')));
    actor.send({ type: 'TYPE', value: 'preston' });
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('editing'));
    expect(actor.getSnapshot().context.username).toBe('preston');
    expect(actor.getSnapshot().context.error).toEqual({ message: 'That username is taken.', fields: undefined });
  });

  it('carries field copy through when the rejection names the control', async () => {
    const failure = new UserProfileSaveError('Your username could not be updated.', {
      username: 'That username is taken.',
    });
    const actor = start(() => Promise.reject(failure));
    actor.send({ type: 'TYPE', value: 'preston' });
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() =>
      expect(actor.getSnapshot().context.error?.fields).toEqual({ username: 'That username is taken.' }),
    );
  });

  it('falls back to generic copy when the rejection is not an Error', async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- a non-Error rejection is the case under test
    const actor = start(() => Promise.reject('nope'));
    actor.send({ type: 'TYPE', value: 'preston' });
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() =>
      expect(actor.getSnapshot().context.error?.message).toBe('Something went wrong. Please try again.'),
    );
  });

  it('refuses to save a value that has not moved', () => {
    const saveUsername = vi.fn(() => Promise.resolve());
    const actor = start(saveUsername);

    actor.send({ type: 'SAVE' });

    // The guard holds the transition, so the rule survives a SAVE from anywhere, not just the button.
    expect(actor.getSnapshot().value).toBe('editing');
    expect(saveUsername).not.toHaveBeenCalled();
  });

  it('refuses to save an empty value, since clearing a username is not on offer', () => {
    const saveUsername = vi.fn(() => Promise.resolve());
    const actor = start(saveUsername);
    actor.send({ type: 'TYPE', value: '' });

    actor.send({ type: 'SAVE' });

    expect(actor.getSnapshot().value).toBe('editing');
    expect(saveUsername).not.toHaveBeenCalled();
  });

  it('drops the error when the dialog is cancelled', async () => {
    const actor = start(() => Promise.reject(new Error('nope')));
    actor.send({ type: 'TYPE', value: 'preston' });
    actor.send({ type: 'SAVE' });
    await vi.waitFor(() => expect(actor.getSnapshot().context.error?.message).toBe('nope'));

    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBeUndefined();
  });
});

describe('useUserProfileEditUsernameController', () => {
  it('holds the dialog open across editing and saving, then closes on success', async () => {
    const { result } = renderHook(() =>
      useUserProfileEditUsernameController({ username: 'prestonxyz', onSubmit: () => Promise.resolve() }),
    );
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.onOpenChange(true));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.username).toBe('prestonxyz');
    expect(result.current.isSaving).toBe(false);

    act(() => result.current.onUsernameChange('preston'));
    expect(result.current.username).toBe('preston');

    act(() => result.current.onSubmit());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isSaving).toBe(true);

    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('saves the value it is currently holding', async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useUserProfileEditUsernameController({ username: 'prestonxyz', onSubmit }));

    act(() => result.current.onOpenChange(true));
    act(() => result.current.onUsernameChange('ada'));
    act(() => result.current.onSubmit());

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('ada'));
  });

  it('withholds the save until the value moves', () => {
    const { result } = renderHook(() =>
      useUserProfileEditUsernameController({ username: 'prestonxyz', onSubmit: () => Promise.resolve() }),
    );

    act(() => result.current.onOpenChange(true));
    expect(result.current.canSave).toBe(false);

    act(() => result.current.onUsernameChange('ada'));
    expect(result.current.canSave).toBe(true);
  });

  it('withholds the save on an empty value', () => {
    const { result } = renderHook(() =>
      useUserProfileEditUsernameController({ username: 'prestonxyz', onSubmit: () => Promise.resolve() }),
    );

    act(() => result.current.onOpenChange(true));
    act(() => result.current.onUsernameChange(''));

    expect(result.current.canSave).toBe(false);
  });
});
