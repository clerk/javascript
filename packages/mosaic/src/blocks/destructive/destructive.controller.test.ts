import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ActionContext } from '../../hooks/useAction';
import { deferred } from '../../machines/__tests__/test-utils';
import { useDestructiveController } from './destructive.controller';

function renderController(fn: (ctx: ActionContext) => Promise<unknown>) {
  return renderHook(() => useDestructiveController(fn));
}

describe('useDestructiveController', () => {
  it('starts closed and opens from the opener or from onOpenChange', () => {
    const { result } = renderController(() => Promise.resolve());
    expect(result.current.open).toBe(false);
    expect(result.current.isDeleting).toBe(false);

    act(() => result.current.openDestructiveDialog());
    expect(result.current.open).toBe(true);

    act(() => result.current.onOpenChange(false));
    expect(result.current.open).toBe(false);

    act(() => result.current.onOpenChange(true));
    expect(result.current.open).toBe(true);
  });

  it('stays open and pending until the action resolves, then closes', async () => {
    const pending = deferred<void>();
    const fn = vi.fn(() => pending.promise);
    const { result } = renderController(fn);
    act(() => result.current.onOpenChange(true));

    let deleting: Promise<void> | undefined;
    act(() => {
      deleting = result.current.onDelete();
    });
    expect(fn).toHaveBeenCalledOnce();
    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(true);

    await act(async () => {
      pending.resolve();
      await deleting;
    });
    expect(result.current.open).toBe(false);
    expect(result.current.isDeleting).toBe(false);
  });

  it('stays open with a message when the action fails, and a retry can succeed', async () => {
    const fn = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(new Error('Your subscription is still active.'))
      .mockResolvedValueOnce(undefined);
    const { result } = renderController(fn);
    act(() => result.current.onOpenChange(true));

    await act(async () => {
      await result.current.onDelete();
    });
    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.errorMessage).toBe('Something went wrong');

    await act(async () => {
      await result.current.onDelete();
    });
    expect(result.current.open).toBe(false);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('clears the error when the dialog is closed', async () => {
    const { result } = renderController(() => Promise.reject(new Error('nope')));
    act(() => result.current.onOpenChange(true));
    await act(async () => {
      await result.current.onDelete();
    });

    act(() => result.current.onOpenChange(false));
    act(() => result.current.onOpenChange(true));

    expect(result.current.errorMessage).toBeUndefined();
  });

  it('ignores a close while the action is in flight without a prompt', async () => {
    const pending = deferred<void>();
    const { result } = renderController(() => pending.promise);
    act(() => result.current.onOpenChange(true));
    act(() => {
      void result.current.onDelete();
    });

    act(() => result.current.onOpenChange(false));
    expect(result.current.open).toBe(true);
    expect(result.current.isDeleting).toBe(true);

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
  });

  it('cancels the prompt instead of closing while the action waits on it', async () => {
    const pending = deferred<void>();
    const prompt = { content: null, cancel: vi.fn() };
    const { result } = renderHook(() => useDestructiveController(() => pending.promise, prompt));
    act(() => result.current.onOpenChange(true));
    act(() => {
      void result.current.onDelete();
    });

    act(() => result.current.onOpenChange(false));

    expect(prompt.cancel).toHaveBeenCalledOnce();
    expect(result.current.open).toBe(true);

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
  });

  it('closes without a message when the action ends cancelled', async () => {
    const { result } = renderController(ctx => Promise.resolve().then(() => ctx.cancelled()));
    act(() => result.current.onOpenChange(true));

    await act(async () => {
      await result.current.onDelete();
    });

    expect(result.current.open).toBe(false);
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('closes in the same render the action settles', async () => {
    const work = deferred<void>();
    const renders: string[] = [];
    const { result } = renderHook(
      () => {
        const controller = useDestructiveController(() => work.promise);
        renders.push(`${controller.open ? 'open' : 'closed'} ${controller.isDeleting ? 'deleting' : 'idle'}`);
        return controller;
      },
      { legacyRoot: true },
    );
    act(() => result.current.openDestructiveDialog());
    act(() => {
      void result.current.onDelete();
    });

    work.resolve();
    await vi.waitFor(() => expect(result.current.open).toBe(false));

    expect(renders.slice(renders.indexOf('open deleting'))).toEqual(['open deleting', 'closed idle']);
  });
});
