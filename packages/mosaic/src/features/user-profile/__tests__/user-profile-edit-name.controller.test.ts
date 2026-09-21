import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../../machine/createActor';
import type { FormError, SaveResult } from '../../../utils/save-result';
import {
  userProfileEditNameMachine,
  useUserProfileEditNameController,
} from '../user-profile-account-section/user-profile-edit-name.controller';
import type { UserProfileEditNameField } from '../user-profile-account-section/user-profile-edit-name.dialog';

type Result = SaveResult<UserProfileEditNameField>;

const saved = (): Promise<Result> => Promise.resolve({ error: null });
const failed = (error: FormError<UserProfileEditNameField>): Promise<Result> =>
  Promise.resolve({ error: { kind: 'form', ...error } });
const cancelled = (): Promise<Result> => Promise.resolve({ error: { kind: 'cancelled' } });

function start(saveName: () => Promise<Result>, saved = { savedFirstName: 'Preston', savedLastName: 'Booth' }) {
  const actor = createActor(userProfileEditNameMachine, { context: { saveName, ...saved } }).start();
  actor.send({ type: 'OPEN' });
  return actor;
}

describe('userProfileEditNameMachine', () => {
  it('seeds both fields from the saved name on open', () => {
    const actor = start(saved);

    expect(actor.getSnapshot().value).toBe('editing');
    expect(actor.getSnapshot().context.firstName).toBe('Preston');
    expect(actor.getSnapshot().context.lastName).toBe('Booth');
  });

  it('returns to idle when the save lands, and can be opened again', async () => {
    const actor = start(saved);
    actor.send({ type: 'TYPE', field: 'lastName', value: 'Barton' });
    actor.send({ type: 'SAVE' });
    expect(actor.getSnapshot().value).toBe('saving');

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('idle'));
    expect(actor.getSnapshot().status).toBe('active');

    actor.send({ type: 'OPEN' });
    expect(actor.getSnapshot().value).toBe('editing');
  });

  it('re-seeds from the saved name on the next open, dropping what was typed', () => {
    const actor = start(saved);
    actor.send({ type: 'TYPE', field: 'firstName', value: 'Ada' });
    actor.send({ type: 'CANCEL' });

    actor.send({ type: 'OPEN' });

    expect(actor.getSnapshot().context.firstName).toBe('Preston');
  });

  it('keeps what was typed when the save fails, so it can be corrected', async () => {
    const actor = start(() => failed({ message: 'Your name could not be updated.' }));
    actor.send({ type: 'TYPE', field: 'lastName', value: 'Barton' });
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('editing'));
    expect(actor.getSnapshot().context.lastName).toBe('Barton');
    expect(actor.getSnapshot().context.error).toEqual({
      message: 'Your name could not be updated.',
    });
  });

  it('carries field copy through when the error names a control', async () => {
    const actor = start(() =>
      failed({ message: 'Your name could not be updated.', fields: { firstName: 'First name is required.' } }),
    );
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() =>
      expect(actor.getSnapshot().context.error?.fields).toEqual({ firstName: 'First name is required.' }),
    );
  });

  it('falls back to generic copy when the save throws something that is not an Error', async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- a non-Error rejection is the case under test
    const actor = start(() => Promise.reject('nope'));
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() =>
      expect(actor.getSnapshot().context.error?.message).toBe('Something went wrong. Please try again.'),
    );
  });

  it('stays open without a banner when the save is cancelled', async () => {
    const actor = start(cancelled);
    actor.send({ type: 'SAVE' });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('editing'));
    expect(actor.getSnapshot().context.error).toBeUndefined();
  });

  it('drops the error when the dialog is cancelled', async () => {
    const actor = start(() => failed({ message: 'nope' }));
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
      useUserProfileEditNameController({ firstName: 'Preston', lastName: 'Booth', onSubmit: saved }),
    );
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.onOpenChange(true));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.firstName).toBe('Preston');
    expect(result.current.isSaving).toBe(false);

    act(() => result.current.onLastNameChange('Barton'));
    expect(result.current.lastName).toBe('Barton');

    act(() => result.current.onSubmit());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isSaving).toBe(true);

    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('saves the values it is currently holding', async () => {
    const onSubmit = vi.fn(saved);
    const { result } = renderHook(() =>
      useUserProfileEditNameController({ firstName: 'Preston', lastName: 'Booth', onSubmit }),
    );

    act(() => result.current.onOpenChange(true));
    act(() => result.current.onFirstNameChange('Ada'));
    act(() => result.current.onSubmit());

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ firstName: 'Ada', lastName: 'Booth' }));
  });
});
