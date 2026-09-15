import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import {
  userProfileDeleteSectionMachine,
  useUserProfileDeleteSectionController,
} from './user-profile-delete-section.controller';

function start(deleteAccount: () => Promise<void>) {
  const actor = createActor(userProfileDeleteSectionMachine, { context: { deleteAccount } }).start();
  actor.send({ type: 'OPEN' });
  return actor;
}

describe('userProfileDeleteSectionMachine', () => {
  it('finishes in deleted when the account goes', async () => {
    const actor = start(() => Promise.resolve());
    actor.send({ type: 'CONFIRM' });
    expect(actor.getSnapshot().value).toBe('deleting');

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('deleted'));
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('returns to confirming with the reason when the delete fails', async () => {
    const actor = start(() => Promise.reject(new Error('Your subscription is still active.')));
    actor.send({ type: 'CONFIRM' });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('confirming'));
    expect(actor.getSnapshot().context.errorMessage).toBe('Your subscription is still active.');
  });

  it('falls back to generic copy when the rejection is not an Error', async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- a non-Error rejection is the case under test
    const actor = start(() => Promise.reject('nope'));
    actor.send({ type: 'CONFIRM' });

    await vi.waitFor(() =>
      expect(actor.getSnapshot().context.errorMessage).toBe('Something went wrong. Please try again.'),
    );
  });

  it('drops the error when the dialog is cancelled', async () => {
    const actor = start(() => Promise.reject(new Error('nope')));
    actor.send({ type: 'CONFIRM' });
    await vi.waitFor(() => expect(actor.getSnapshot().context.errorMessage).toBe('nope'));

    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.errorMessage).toBeUndefined();
  });
});

describe('useUserProfileDeleteSectionController', () => {
  it('holds the dialog open across confirming and deleting', async () => {
    const { result } = renderHook(() => useUserProfileDeleteSectionController({ onDelete: () => Promise.resolve() }));
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.onOpenChange(true));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isDeleting).toBe(false);

    act(() => result.current.onConfirm());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isDeleting).toBe(true);

    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('cancels on close', () => {
    const { result } = renderHook(() => useUserProfileDeleteSectionController({ onDelete: () => Promise.resolve() }));
    act(() => result.current.onOpenChange(true));

    act(() => result.current.onOpenChange(false));

    expect(result.current.isOpen).toBe(false);
  });
});
