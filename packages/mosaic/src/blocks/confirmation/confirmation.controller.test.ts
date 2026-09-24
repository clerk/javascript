import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { confirmationMachine, useConfirmationController } from './confirmation.controller';

function start() {
  const actor = createActor(confirmationMachine).start();
  actor.send({ type: 'OPEN' });
  return actor;
}

describe('confirmationMachine', () => {
  it('opens into confirming and cancels back to idle', () => {
    const actor = start();
    expect(actor.getSnapshot().value).toBe('confirming');

    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('runs the confirmed action and returns to idle when it lands', async () => {
    const run = vi.fn(() => Promise.resolve());
    const actor = start();

    actor.send({ type: 'CONFIRM', run });
    expect(actor.getSnapshot().value).toBe('pending');

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('idle'));
    expect(run).toHaveBeenCalledOnce();
    expect(actor.getSnapshot().status).toBe('active');
  });

  it('holds the dialog open while the action is pending', () => {
    const actor = start();
    actor.send({ type: 'CONFIRM', run: () => new Promise(() => {}) });

    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('pending');
  });

  it('lands back on confirming with the reason when the action fails', async () => {
    const actor = start();
    actor.send({ type: 'CONFIRM', run: () => Promise.reject(new Error('Google is your only way to sign in.')) });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('confirming'));
    expect(actor.getSnapshot().context.error).toBe('Google is your only way to sign in.');
  });

  it('falls back to generic copy when the rejection is not an Error', async () => {
    const actor = start();
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- a non-Error rejection is the case under test
    actor.send({ type: 'CONFIRM', run: () => Promise.reject('nope') });

    await vi.waitFor(() => expect(actor.getSnapshot().context.error).toBe('Something went wrong. Please try again.'));
  });

  it('drops the error when cancelled, so the next open starts clean', async () => {
    const actor = start();
    actor.send({ type: 'CONFIRM', run: () => Promise.reject(new Error('nope')) });
    await vi.waitFor(() => expect(actor.getSnapshot().context.error).toBe('nope'));

    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBeUndefined();
  });
});

describe('useConfirmationController', () => {
  it('holds the dialog open across confirming and pending, then closes on success', async () => {
    const { result } = renderHook(() => useConfirmationController());
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.onOpenChange(true));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isConfirming).toBe(false);

    act(() => result.current.onConfirm(() => Promise.resolve()));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isConfirming).toBe(true);

    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('surfaces a failure as the error message and stays open', async () => {
    const { result } = renderHook(() => useConfirmationController());
    act(() => result.current.onOpenChange(true));

    act(() => result.current.onConfirm(() => Promise.reject(new Error('nope'))));

    await waitFor(() => expect(result.current.errorMessage).toBe('nope'));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isConfirming).toBe(false);
  });
});
