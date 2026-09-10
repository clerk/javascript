import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { userProfileEditNameMachine, useUserProfileEditNameController } from './user-profile-edit-name.controller';

function start(saveName: () => Promise<void>, saved = { savedFirstName: 'Preston', savedLastName: 'Booth' }) {
  const actor = createActor(userProfileEditNameMachine, { context: { saveName, ...saved } }).start();
  actor.send({ type: 'OPEN' });
  return actor;
}

describe('userProfileEditNameMachine', () => {
  it('seeds both fields from the saved name on open', () => {
    const actor = start(() => Promise.resolve());

    expect(actor.getSnapshot().value).toBe('editing');
    expect(actor.getSnapshot().context.firstName).toBe('Preston');
    expect(actor.getSnapshot().context.lastName).toBe('Booth');
  });

  it('returns to idle when the save lands, and can be opened again', async () => {
    const actor = start(() => Promise.resolve());
    actor.send({ type: 'TYPE', field: 'lastName', value: 'Barton' });
    actor.send({ type: 'SAVE' });
    expect(actor.getSnapshot().value).toBe('saving');

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('idle'));
    expect(actor.getSnapshot().status).toBe('active');

    actor.send({ type: 'OPEN' });
    expect(actor.getSnapshot().value).toBe('editing');
  });

  it('re-seeds from the saved name on the next open, dropping what was typed', () => {
    const actor = start(() => Promise.resolve());
    actor.send({ type: 'TYPE', field: 'firstName', value: 'Ada' });
    actor.send({ type: 'CANCEL' });

    actor.send({ type: 'OPEN' });

    expect(actor.getSnapshot().context.firstName).toBe('Preston');
  });

  it('keeps what was typed when the save fails, so it can be corrected', async () => {
    const actor = start(() => Promise.reject(new Error('Your name could not be updated.')));
    actor.send({ type: 'TYPE', field: 'lastName', value: 'Barton' });
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('editing'));
    expect(actor.getSnapshot().context.lastName).toBe('Barton');
    expect(actor.getSnapshot().context.error).toEqual({
      message: 'Your name could not be updated.',
      fields: undefined,
    });
  });

  it('carries field copy through when the rejection names a control', async () => {
    const failure = Object.assign(new Error('Your name could not be updated.'), {
      fields: { firstName: 'First name is required.' },
    });
    const actor = start(() => Promise.reject(failure));
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() =>
      expect(actor.getSnapshot().context.error?.fields).toEqual({ firstName: 'First name is required.' }),
    );
  });

  it('falls back to generic copy when the rejection is not an Error', async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- a non-Error rejection is the case under test
    const actor = start(() => Promise.reject('nope'));
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() =>
      expect(actor.getSnapshot().context.error?.message).toBe('Something went wrong. Please try again.'),
    );
  });

  it('drops the error when the dialog is cancelled', async () => {
    const actor = start(() => Promise.reject(new Error('nope')));
    actor.send({ type: 'SAVE' });
    await vi.waitFor(() => expect(actor.getSnapshot().context.error?.message).toBe('nope'));

    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBeUndefined();
  });
});

describe('useUserProfileEditNameController', () => {
  it('holds the dialog open across editing and saving, then closes on success', async () => {
    const { result } = renderHook(() =>
      useUserProfileEditNameController({ firstName: 'Preston', lastName: 'Booth', onSave: () => Promise.resolve() }),
    );
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.onOpenChange(true));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.firstName).toBe('Preston');
    expect(result.current.isSaving).toBe(false);

    act(() => result.current.onLastNameChange('Barton'));
    expect(result.current.lastName).toBe('Barton');

    act(() => result.current.onSave());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isSaving).toBe(true);

    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('saves the values it is currently holding', async () => {
    const onSave = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() =>
      useUserProfileEditNameController({ firstName: 'Preston', lastName: 'Booth', onSave }),
    );

    act(() => result.current.onOpenChange(true));
    act(() => result.current.onFirstNameChange('Ada'));
    act(() => result.current.onSave());

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ firstName: 'Ada', lastName: 'Booth' }));
  });
});
