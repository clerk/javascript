import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../__tests__/async';
import { useConfirmController } from '../../blocks/confirm';
import { SaveError } from '../../utils/errors';
import { usePendingAction } from '../use-pending-action';

function useOwners(onConfirm: () => Promise<void>) {
  const actions = usePendingAction();
  const remove = useConfirmController({
    onConfirm,
    reverification: { status: 'loading', visible: true, onCancel: vi.fn() },
  });
  return {
    actions,
    remove: {
      ...remove,
      confirm: async () => (await actions.runExternal(() => remove.confirm())) ?? false,
    },
  };
}

describe('shared action admission', () => {
  it('refuses removal in the same stack as primary without changing the dialog', async () => {
    const pending = deferred<void>();
    const onConfirm = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useOwners(onConfirm));
    act(() => result.current.remove.onOpenChange(true));
    const owners = result.current;

    act(() => {
      void owners.actions.run('primary', () => pending.promise);
      void owners.remove.confirm();
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(result.current.remove.isOpen).toBe(true);
    expect(result.current.remove.isPending).toBe(false);
    expect(result.current.actions.isPending).toBe(true);
    await act(() => pending.resolve());
    expect(result.current.actions.isPending).toBe(false);
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
      void owners.remove.confirm();
      expect(await owners.actions.run('primary', primary)).toBe(false);
    });

    expect(primary).not.toHaveBeenCalled();
    expect(result.current.actions.lastKey).toBeUndefined();
    expect(result.current.actions.error).toBeUndefined();
    expect(result.current.actions.isPending).toBe(true);
    await act(() => pending.resolve());
    await act(async () => expect(await owners.actions.run('primary', primary)).toBe(true));
    expect(primary).toHaveBeenCalledOnce();
  });

  it('keeps a rejected removal error while primary makes confirmation busy', async () => {
    const pending = deferred<void>();
    const failure = new SaveError({ global: { code: 'action_blocked', message: 'Removal refused.' } });
    const onConfirm = vi.fn(() => Promise.reject(failure));
    const { result } = renderHook(() => useOwners(onConfirm));
    act(() => result.current.remove.onOpenChange(true));
    await act(() => result.current.remove.confirm());
    const error = result.current.remove.errorMessage;
    expect(error).toBeDefined();
    expect(result.current.remove.isOpen).toBe(true);
    expect(result.current.actions.error).toBeUndefined();

    act(() => {
      void result.current.actions.run('primary', () => pending.promise);
      void result.current.remove.confirm();
    });

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(result.current.remove.errorMessage).toBe(error);
    expect(result.current.remove.isOpen).toBe(true);
    expect(result.current.remove.isPending).toBe(false);
    await act(() => pending.resolve());
  });

  it('preserves the primary error and focus key while removal runs', async () => {
    const pending = deferred<void>();
    const failure = new SaveError({ global: { code: 'action_blocked', message: 'Primary refused.' } });
    const { result } = renderHook(() => useOwners(() => pending.promise));
    await act(() => result.current.actions.run('email', () => Promise.reject(failure)));
    const error = result.current.actions.error;
    expect(error).toBeDefined();

    act(() => result.current.remove.onOpenChange(true));
    act(() => {
      void result.current.remove.confirm();
    });

    expect(result.current.actions.isPending).toBe(true);
    expect(result.current.actions.pendingKey).toBeUndefined();
    expect(result.current.actions.lastKey).toBe('email');
    expect(result.current.actions.errorKey).toBe('email');
    expect(result.current.actions.error).toBe(error);
    await act(() => pending.resolve());
    expect(result.current.actions.isPending).toBe(false);
    expect(result.current.actions.error).toBe(error);
  });

  it.each(['resolve', 'reject'])('holds pending after cancellation until removal promises %s', async outcome => {
    const pending = deferred<void>();
    const primary = vi.fn();
    const { result } = renderHook(() => useOwners(() => pending.promise));
    act(() => result.current.remove.onOpenChange(true));
    act(() => {
      void result.current.remove.confirm();
    });
    act(() => result.current.remove.onOpenChange(false));
    expect(result.current.remove.isOpen).toBe(false);
    await act(async () => expect(await result.current.actions.run('primary', primary)).toBe(false));
    expect(primary).not.toHaveBeenCalled();
    expect(result.current.actions.isPending).toBe(true);
    expect(result.current.actions.pendingKey).toBeUndefined();

    await act(() => {
      if (outcome === 'reject') {
        pending.reject(new Error('Late removal failure'));
      } else {
        pending.resolve();
      }
    });
    expect(result.current.actions.isPending).toBe(false);
    expect(result.current.remove.errorMessage).toBeUndefined();
    await act(async () => expect(await result.current.actions.run('primary', primary)).toBe(true));
  });
});

describe('external pending actions', () => {
  it('returns the accepted result and refuses reentrant work synchronously', async () => {
    const { result } = renderHook(() => usePendingAction());
    const other = vi.fn();
    await act(async () => {
      const accepted = result.current.runExternal(() => {
        expect(result.current.runExternal(other)).toBeUndefined();
        return 42;
      });
      expect(await accepted).toBe(42);
    });
    expect(other).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(false);
  });

  it.each(['throw', 'reject'])('preserves the original %s and releases admission', async mode => {
    const { result } = renderHook(() => usePendingAction());
    const failure = new Error('Original failure');
    await act(async () => {
      const accepted = result.current.runExternal(() => {
        if (mode === 'throw') {
          throw failure;
        }
        return Promise.reject(failure);
      });
      await expect(accepted).rejects.toBe(failure);
    });
    expect(result.current.isPending).toBe(false);
    await act(async () => expect(await result.current.runExternal(() => 'retry')).toBe('retry'));
  });
});
