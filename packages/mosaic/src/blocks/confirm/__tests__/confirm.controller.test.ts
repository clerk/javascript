import { ClerkRuntimeError } from '@clerk/shared/error';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { createActor } from '../../../machine/create-actor';
import { SaveError } from '../../../utils/errors';
import { confirmMachine, useConfirmController } from '../confirm.controller';

const blocked = new SaveError({ global: { code: 'action_blocked', message: 'Raw server sentence.' } });
const cancelled = new ClerkRuntimeError('cancelled', { code: 'reverification_cancelled' });

function start() {
  const actor = createActor(confirmMachine).start();
  actor.send({ type: 'OPEN' });
  return actor;
}

describe('confirmMachine', () => {
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

  it('abandons the run when cancelled while pending, ignoring how it settles', async () => {
    const run = deferred<void>();
    const actor = start();
    actor.send({ type: 'CONFIRM', run: () => run.promise });

    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('idle');

    run.reject(blocked);
    await run.promise.catch(() => undefined);
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBeUndefined();
  });

  it('lands back on confirming with the reason when the action fails', async () => {
    const actor = start();
    actor.send({ type: 'CONFIRM', run: () => Promise.reject(blocked) });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('confirming'));
    expect(actor.getSnapshot().context.error).toEqual(blocked.formError.global);
  });

  it('keeps the cause of an unexpected error, never its message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const cause = new Error('Cannot read properties of undefined');
    const actor = start();
    actor.send({ type: 'CONFIRM', run: () => Promise.reject(cause) });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('confirming'));
    expect(actor.getSnapshot().context.error).toEqual({ cause });
  });

  it('closes without a reason when the action was cancelled by reverification', async () => {
    const actor = start();
    actor.send({ type: 'CONFIRM', run: () => Promise.reject(cancelled) });

    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('idle'));
    expect(actor.getSnapshot().context.error).toBeUndefined();
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

describe('useConfirmController', () => {
  it.each(['resolve', 'reject'])(
    'keeps its completion pending after cancellation until the action can %s',
    async outcome => {
      const pending = deferred<void>();
      const { result } = renderHook(() =>
        useConfirmController({
          onConfirm: () => pending.promise,
          reverification: { status: 'loading', visible: true, onCancel: vi.fn() },
        }),
      );
      const completed = vi.fn();
      act(() => result.current.onOpenChange(true));
      let completion: ReturnType<typeof result.current.confirm> | undefined;
      act(() => {
        completion = result.current.confirm();
      });
      expect(completion).toBeInstanceOf(Promise);
      void completion?.then(completed);
      act(() => result.current.onOpenChange(false));
      await act(async () => {
        await Promise.resolve();
      });
      expect(result.current.isOpen).toBe(false);
      expect(completed).not.toHaveBeenCalled();

      await act(async () => {
        if (outcome === 'reject') {
          pending.reject(cancelled);
        } else {
          pending.resolve();
        }
        await completion;
      });

      expect(completed).toHaveBeenCalledWith(outcome === 'resolve');
      expect(result.current.errorMessage).toBeUndefined();
    },
  );

  it('ignores open while no block is mounted on the controller, and keeps one handle across renders', () => {
    const { result, rerender } = renderHook(() => useConfirmController({ onConfirm: () => Promise.resolve() }));
    const { handle } = result.current;

    act(() => result.current.open());
    rerender();

    expect(result.current.isOpen).toBe(false);
    expect(result.current.handle).toBe(handle);
  });

  it('ignores confirm while closed and while a run is pending', async () => {
    const pending = deferred<void>();
    const onConfirm = vi.fn(() => pending.promise);
    const { result } = renderHook(() => useConfirmController({ onConfirm }));

    await act(async () => expect(await result.current.confirm()).toBe(false));
    expect(onConfirm).not.toHaveBeenCalled();

    act(() => result.current.onOpenChange(true));
    const confirm = result.current.confirm;
    let completion: ReturnType<typeof confirm> | undefined;
    let duplicate: ReturnType<typeof confirm> | undefined;
    act(() => {
      completion = confirm();
      duplicate = confirm();
    });
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(await duplicate).toBe(false);

    await act(async () => {
      pending.resolve();
      expect(await completion).toBe(true);
    });
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });
});
