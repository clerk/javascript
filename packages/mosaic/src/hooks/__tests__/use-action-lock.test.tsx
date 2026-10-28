import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../__tests__/async';
import { useConfirmController } from '../../blocks/confirm';
import { SaveError } from '../../utils/errors';
import { useActionLock } from '../use-action-lock';
import { usePendingAction } from '../use-pending-action';

function useOwners(onConfirm: () => Promise<void>) {
  const actionLock = useActionLock();
  const primary = usePendingAction({ actionLock });
  const remove = useConfirmController({
    actionLock,
    onConfirm,
    reverification: { status: 'loading', visible: true, onCancel: vi.fn() },
  });
  return { actionLock, primary, remove };
}

describe('shared action admission', () => {
  it('refuses removal in the same stack as primary without changing the dialog', async () => {
    const pending = deferred<void>();
    const onConfirm = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useOwners(onConfirm));
    act(() => result.current.remove.onOpenChange(true));
    const owners = result.current;

    act(() => {
      void owners.primary.run('primary', () => pending.promise);
      owners.remove.confirm();
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(result.current.remove.isOpen).toBe(true);
    expect(result.current.remove.isPending).toBe(false);
    expect(result.current.actionLock.isPending).toBe(true);
    await act(() => pending.resolve());
    expect(result.current.actionLock.isPending).toBe(false);
    await act(() => result.current.remove.confirm());
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(result.current.remove.isOpen).toBe(false);
  });

  it('refuses primary in the same stack as removal without changing primary metadata', async () => {
    const pending = deferred<void>();
    const primary = vi.fn();
    const { result } = renderHook(() => useOwners(() => pending.promise));
    act(() => result.current.remove.onOpenChange(true));
    const owners = result.current;

    await act(async () => {
      owners.remove.confirm();
      expect(await owners.primary.run('primary', primary)).toBe(false);
    });

    expect(primary).not.toHaveBeenCalled();
    expect(result.current.primary.lastKey).toBeUndefined();
    expect(result.current.primary.error).toBeUndefined();
    expect(result.current.actionLock.isPending).toBe(true);
    await act(() => pending.resolve());
    await act(async () => expect(await owners.primary.run('primary', primary)).toBe(true));
    expect(primary).toHaveBeenCalledOnce();
  });

  it('keeps a rejected removal error when another owner makes confirmation busy', async () => {
    const pending = deferred<void>();
    const failure = new SaveError({ global: { code: 'action_blocked', message: 'Removal refused.' } });
    const onConfirm = vi.fn(() => Promise.reject(failure));
    const { result } = renderHook(() => useOwners(onConfirm));
    act(() => result.current.remove.onOpenChange(true));
    await act(() => result.current.remove.confirm());
    const error = result.current.remove.errorMessage;
    expect(error).toBeDefined();
    expect(result.current.remove.isOpen).toBe(true);
    expect(result.current.primary.error).toBeUndefined();

    act(() => {
      void result.current.primary.run('primary', () => pending.promise);
      result.current.remove.confirm();
    });

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(result.current.remove.errorMessage).toBe(error);
    expect(result.current.remove.isOpen).toBe(true);
    expect(result.current.remove.isPending).toBe(false);
    await act(() => pending.resolve());
  });

  it('holds admission after cancelling observation until the underlying removal settles', async () => {
    const pending = deferred<void>();
    const primary = vi.fn();
    const { result } = renderHook(() => useOwners(() => pending.promise));
    act(() => result.current.remove.onOpenChange(true));
    act(() => result.current.remove.confirm());
    act(() => result.current.remove.onOpenChange(false));
    expect(result.current.remove.isOpen).toBe(false);
    await act(async () => expect(await result.current.primary.run('primary', primary)).toBe(false));
    expect(primary).not.toHaveBeenCalled();
    expect(result.current.actionLock.isPending).toBe(true);

    await act(() => pending.reject(new Error('Late removal failure')));
    expect(result.current.actionLock.isPending).toBe(false);
    expect(result.current.remove.errorMessage).toBeUndefined();
    await act(async () => expect(await result.current.primary.run('primary', primary)).toBe(true));
  });
});

describe('useActionLock', () => {
  it('returns the accepted result and refuses reentrant work synchronously', async () => {
    const { result } = renderHook(() => useActionLock());
    const other = vi.fn();
    await act(async () => {
      const accepted = result.current.tryRun(() => {
        expect(result.current.tryRun(other)).toBeUndefined();
        return 42;
      });
      expect(await accepted).toBe(42);
    });
    expect(other).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(false);
  });

  it.each(['throw', 'reject'])('preserves the original %s and releases admission', async mode => {
    const { result } = renderHook(() => useActionLock());
    const failure = new Error('Original failure');
    await act(async () => {
      const accepted = result.current.tryRun(() => {
        if (mode === 'throw') {
          throw failure;
        }
        return Promise.reject(failure);
      });
      await expect(accepted).rejects.toBe(failure);
    });
    expect(result.current.isPending).toBe(false);
    await act(async () => expect(await result.current.tryRun(() => 'retry')).toBe('retry'));
  });
});
