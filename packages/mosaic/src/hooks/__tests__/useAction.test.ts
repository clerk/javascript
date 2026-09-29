import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../machines/__tests__/test-utils';
import type { ActionContext, ActionResult } from '../useAction';
import { useAction } from '../useAction';

describe('useAction', () => {
  it('runs the action and resolves done with its value', async () => {
    const { result } = renderHook(() =>
      useAction((_ctx: ActionContext, id: string) => Promise.resolve(`deleted ${id}`)),
    );

    expect(result.current.state).toEqual({ status: 'idle' });

    let outcome: ActionResult<string> | undefined;
    await act(async () => {
      outcome = await result.current.run('user_1');
    });

    expect(outcome).toEqual({ status: 'done', value: 'deleted user_1' });
    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('is running with no prompt while the action is in flight', async () => {
    const work = deferred<void>();
    const { result } = renderHook(() => useAction(() => work.promise));

    let pending: Promise<ActionResult<void>> | undefined;
    act(() => {
      pending = result.current.run();
    });

    expect(result.current.state).toEqual({ status: 'running' });

    await act(async () => {
      work.resolve();
      await pending;
    });
    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('resolves failed and keeps the error in state instead of throwing', async () => {
    const error = new Error('nope');
    const { result } = renderHook(() => useAction(() => Promise.reject(error)));

    let outcome: ActionResult<never> | undefined;
    await act(async () => {
      outcome = await result.current.run();
    });

    expect(outcome).toEqual({ status: 'failed', error });
    expect(result.current.state).toEqual({ status: 'failed', error });

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('returns the in-flight run instead of starting a second one', async () => {
    const work = deferred<string>();
    const fn = vi.fn(() => work.promise);
    const { result } = renderHook(() => useAction(fn));

    let first: Promise<ActionResult<string>> | undefined;
    let second: Promise<ActionResult<string>> | undefined;
    act(() => {
      first = result.current.run();
      second = result.current.run();
    });

    expect(second).toBe(first);
    await act(async () => {
      work.resolve('ok');
      await first;
    });
    expect(fn).toHaveBeenCalledOnce();
  });

  it('resolves cancelled when the action calls ctx.cancelled', async () => {
    const { result } = renderHook(() =>
      useAction((ctx: ActionContext) => Promise.resolve().then(() => ctx.cancelled())),
    );

    let outcome: ActionResult<never> | undefined;
    await act(async () => {
      outcome = await result.current.run();
    });

    expect(outcome).toEqual({ status: 'cancelled' });
  });

  it('applies onSettled updates in the same render as the settled state', async () => {
    const work = deferred<void>();
    const renders: string[] = [];
    const { result } = renderHook(
      () => {
        const [closed, setClosed] = useState(false);
        const action = useAction(async (ctx: ActionContext) => {
          ctx.onSettled(() => setClosed(true));
          await work.promise;
        });
        renders.push(`${action.state.status} ${closed ? 'closed' : 'open'}`);
        return action;
      },
      { legacyRoot: true },
    );

    act(() => {
      void result.current.run();
    });
    work.resolve();
    await vi.waitFor(() => expect(renders.at(-1)).toBe('idle closed'));

    expect(renders.slice(renders.indexOf('running open'))).toEqual(['running open', 'idle closed']);
  });
});
