import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/create-actor';
import { SaveError } from '../../utils/form-error';
import { confirmationMachine, useConfirmationController } from './confirmation.controller';

const blocked = new SaveError({ global: { code: 'action_blocked', message: 'Raw server sentence.' } });

afterEach(() => {
  vi.restoreAllMocks();
});

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
    actor.send({ type: 'CONFIRM', run: () => Promise.reject(blocked) });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('confirming'));
    expect(actor.getSnapshot().context.error).toEqual(blocked.formError.global);
  });

  it('holds nothing of an unexpected error, never its message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const actor = start();
    actor.send({ type: 'CONFIRM', run: () => Promise.reject(new Error('Cannot read properties of undefined')) });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('confirming'));
    expect(actor.getSnapshot().context.error).toEqual({});
  });

  it('drops the error when cancelled, so the next open starts clean', async () => {
    const actor = start();
    actor.send({ type: 'CONFIRM', run: () => Promise.reject(blocked) });
    await vi.waitFor(() => expect(actor.getSnapshot().context.error).toBeDefined());

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

  it('surfaces a failure as the localized copy for its code and stays open', async () => {
    const { result } = renderHook(() => useConfirmationController());
    act(() => result.current.onOpenChange(true));

    act(() => result.current.onConfirm(() => Promise.reject(blocked)));

    await waitFor(() => expect(result.current.errorMessage).toMatch(/contact support/));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isConfirming).toBe(false);
  });

  it('surfaces the fallback it was given for an unexpected error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useConfirmationController({ errorFallback: 'Unable to remove this member.' }));
    act(() => result.current.onOpenChange(true));

    act(() => result.current.onConfirm(() => Promise.reject(new Error('internal'))));

    await waitFor(() => expect(result.current.errorMessage).toBe('Unable to remove this member.'));
  });
});
