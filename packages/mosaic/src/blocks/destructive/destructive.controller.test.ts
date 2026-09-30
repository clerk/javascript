import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { childActor } from '../../machine/createActor';
import { createMachine } from '../../machine/createMachine';
import type { AnyActor } from '../../machine/types';
import { deferred } from '../../machines/__tests__/test-utils';
import { useDestructiveController } from './destructive.controller';

describe('useDestructiveController', () => {
  it('starts closed and opens from the opener or from onOpenChange', () => {
    const { result } = renderHook(() => useDestructiveController({ onDelete: () => Promise.resolve() }));
    expect(result.current.open).toBe(false);
    expect(result.current.isDeleting).toBe(false);

    act(() => result.current.openDestructiveDialog());
    expect(result.current.open).toBe(true);

    act(() => result.current.onOpenChange(false));
    expect(result.current.open).toBe(false);

    act(() => result.current.onOpenChange(true));
    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(false);
  });

  it('ignores the opener once the dialog is already open', () => {
    const { result } = renderHook(() => useDestructiveController({ onDelete: () => Promise.resolve() }));
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onDelete());

    act(() => result.current.openDestructiveDialog());

    expect(result.current.isDeleting).toBe(true);
  });

  it('stays open and pending until the action resolves, then closes', async () => {
    const pending = deferred<void>();
    const onDelete = vi.fn(() => pending.promise);
    const { result } = renderHook(() => useDestructiveController({ onDelete }));
    act(() => result.current.onOpenChange(true));

    act(() => result.current.onDelete());
    expect(onDelete).toHaveBeenCalledOnce();
    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(true);

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(result.current.isDeleting).toBe(false);
  });

  it('stays open with a message when the action rejects, and a retry can succeed', async () => {
    const onDelete = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(new Error('Your subscription is still active.'))
      .mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useDestructiveController({ onDelete }));
    act(() => result.current.onOpenChange(true));

    act(() => result.current.onDelete());
    await waitFor(() => expect(result.current.errorMessage).toBe('Something went wrong'));
    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(false);

    act(() => result.current.onDelete());
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(onDelete).toHaveBeenCalledTimes(2);
  });

  it('ignores a close while the action is in flight', () => {
    const { result } = renderHook(() => useDestructiveController({ onDelete: () => new Promise(() => {}) }));
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onDelete());

    act(() => result.current.onOpenChange(false));

    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(true);
  });

  describe('with an action that pauses for the user', () => {
    type StepEvent = { type: 'NEXT' };
    const pausingAction = createMachine<object, StepEvent>({
      initial: 'asking',
      states: {
        asking: { tags: ['interactive', 'cancellable'], on: { NEXT: 'finishing' } },
        finishing: { tags: ['interactive'], on: { NEXT: 'done' } },
        done: { type: 'final' },
      },
    });
    const next = (actor: AnyActor | undefined) => childActor(actor, pausingAction)?.send({ type: 'NEXT' });

    function openAndConfirm() {
      const hook = renderHook(() => useDestructiveController({ onDelete: pausingAction }));
      act(() => hook.result.current.onOpenChange(true));
      act(() => hook.result.current.onDelete());
      return hook;
    }

    it('shows the verify step with the action actor while the action asks for input', () => {
      const { result } = openAndConfirm();

      expect(result.current.step).toBe('verify');
      expect(result.current.action).toBeDefined();
      expect(result.current.isDeleting).toBe(false);
    });

    it('stops the action when the dialog closes while it is cancellable', () => {
      const { result } = openAndConfirm();
      const child = result.current.action;

      act(() => result.current.onOpenChange(false));

      expect(result.current.open).toBe(false);
      expect(result.current.action).toBeUndefined();
      expect(child?.getSnapshot().status).toBe('stopped');
    });

    it('is deleting and cannot close once the action stops being cancellable', () => {
      const { result } = openAndConfirm();

      act(() => next(result.current.action));
      act(() => result.current.onOpenChange(false));

      expect(result.current.open).toBe(true);
      expect(result.current.step).toBe('verify');
      expect(result.current.isDeleting).toBe(true);
    });

    it('closes when the action finishes', async () => {
      const { result } = openAndConfirm();

      act(() => next(result.current.action));
      act(() => next(result.current.action));

      await waitFor(() => expect(result.current.open).toBe(false));
    });
  });
});
