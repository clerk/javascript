import { ClerkRuntimeError } from '@clerk/shared/error';
import type * as SharedReact from '@clerk/shared/react';
import type { SessionVerificationLevel } from '@clerk/shared/types';
import { act, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActionContext, ActionResult } from '../../../hooks/useAction';
import { useAction } from '../../../hooks/useAction';
import { deferred } from '../../../machines/__tests__/test-utils';
import type { ReverificationState } from '../reverification.types';
import { useReverify } from '../use-reverify';

type NeedsReverificationParameters = {
  complete: () => void;
  cancel: () => void;
  level: SessionVerificationLevel | undefined;
};

type Hint = { reverificationLevel: SessionVerificationLevel | undefined };

let session: { id: string } | null | undefined = { id: 'sess_1' };
let challengeCancel: ReturnType<typeof vi.fn>;
let loading = false;

function isHint(value: unknown): value is Hint {
  return Boolean(value && typeof value === 'object' && 'reverificationLevel' in value);
}

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useSession: () => ({ session }),
    useReverification: (
      fetcher: (...args: unknown[]) => Promise<unknown> | undefined,
      options?: { onNeedsReverification?: (params: NeedsReverificationParameters) => void },
    ) => {
      return async (...args: unknown[]) => {
        const result = await fetcher(...args);
        if (!isHint(result)) {
          return result;
        }
        await new Promise<void>((resolve, reject) => {
          options?.onNeedsReverification?.({
            level: result.reverificationLevel,
            complete: () => resolve(),
            cancel: () => {
              challengeCancel();
              reject(
                new ClerkRuntimeError('User cancelled attempted verification', {
                  code: 'reverification_cancelled',
                }),
              );
            },
          });
        });
        return fetcher(...args);
      };
    },
  };
});

vi.mock('../reverification.model', () => ({
  useReverificationModel: (state: ReverificationState) => state,
}));

vi.mock('../reverification.controller', () => ({
  useReverificationController: (state: ReverificationState) => {
    if (state.phase === 'inactive') {
      return { status: 'idle' };
    }
    if (state.phase === 'retrying') {
      return { status: 'retrying' };
    }
    if (loading) {
      return { status: 'loading', onCancel: state.cancel };
    }
    return { status: `ready ${state.level}`, onCancel: state.cancel, onSubmit: state.complete };
  },
}));

vi.mock('../reverification', () => ({
  Reverification: ({
    status,
    onSubmit,
    onCancel,
  }: {
    status: string;
    onSubmit?: () => void;
    onCancel?: () => void;
  }) => (
    <div>
      <output>{status}</output>
      {onSubmit ? (
        <button
          type='button'
          onClick={onSubmit}
        >
          Complete
        </button>
      ) : null}
      {onCancel ? (
        <button
          type='button'
          onClick={onCancel}
        >
          Cancel
        </button>
      ) : null}
    </div>
  ),
}));

function useDeleteAction(fetcher: () => Promise<unknown>) {
  const { reverify, prompt } = useReverify();
  const action = useAction((ctx: ActionContext) => reverify(ctx, fetcher));
  return { action, prompt };
}

async function startNeedingReverification(fetcher: () => Promise<unknown>) {
  const hook = renderHook(() => useDeleteAction(fetcher));
  let pending: Promise<ActionResult<unknown>> | undefined;
  await act(async () => {
    pending = hook.result.current.action.run();
  });
  const view = render(<>{hook.result.current.prompt?.content}</>);
  return { ...hook, view, pending };
}

describe('useReverify', () => {
  beforeEach(() => {
    session = { id: 'sess_1' };
    challengeCancel = vi.fn();
    loading = false;
  });

  it('passes the value through when no reverification is needed', async () => {
    const { result } = renderHook(() => useDeleteAction(() => Promise.resolve('deleted')));

    let outcome: ActionResult<unknown> | undefined;
    await act(async () => {
      outcome = await result.current.action.run();
    });

    expect(outcome).toEqual({ status: 'done', value: 'deleted' });
  });

  it('holds the prompt back until verification has loaded', async () => {
    loading = true;
    const { result, rerender, pending } = await startNeedingReverification(
      vi.fn().mockResolvedValueOnce({ reverificationLevel: 'first_factor' }).mockResolvedValue('deleted'),
    );

    expect(result.current.action.state.status).toBe('running');
    expect(result.current.prompt).toBeNull();

    loading = false;
    rerender();
    const view = render(<>{result.current.prompt?.content}</>);
    expect(view.getByRole('status')).toHaveTextContent('ready first_factor');

    await act(async () => {
      view.getByRole('button', { name: 'Complete' }).click();
      await expect(pending).resolves.toEqual({ status: 'done', value: 'deleted' });
    });
  });

  it('prompts for reverification and retries once it completes', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ reverificationLevel: 'first_factor' }).mockResolvedValue('deleted');
    const { pending } = await startNeedingReverification(fetcher);

    expect(screen.getByRole('status')).toHaveTextContent('ready first_factor');

    await act(async () => {
      screen.getByRole('button', { name: 'Complete' }).click();
      await expect(pending).resolves.toEqual({ status: 'done', value: 'deleted' });
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(challengeCancel).not.toHaveBeenCalled();
  });

  it('shows retrying while the action runs again', async () => {
    let finishRetry: (value: string) => void = () => {};
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ reverificationLevel: 'first_factor' })
      .mockImplementationOnce(() => new Promise<string>(resolve => (finishRetry = resolve)));
    const { result, view, pending } = await startNeedingReverification(fetcher);

    await act(async () => {
      screen.getByRole('button', { name: 'Complete' }).click();
    });
    const retrying = result.current.prompt;
    view.rerender(<>{retrying?.content}</>);

    expect(retrying?.cancel).toBeUndefined();
    expect(screen.getByRole('status')).toHaveTextContent('retrying');

    await act(async () => {
      finishRetry('deleted');
      await pending;
    });
  });

  it.each([
    ['completed', 'Complete'],
    ['cancelled', 'Cancel'],
  ])('keeps the prompt until the action settles when verification is %s', async (_, button) => {
    const afterRequest = deferred<void>();
    const fetcher = vi.fn().mockResolvedValueOnce({ reverificationLevel: 'first_factor' }).mockResolvedValue('deleted');
    const renders: string[] = [];
    const { result } = renderHook(
      () => {
        const { reverify, prompt } = useReverify();
        const action = useAction(async (ctx: ActionContext) => {
          await reverify(ctx, fetcher);
          await afterRequest.promise;
        });
        renders.push(`${action.state.status} ${prompt ? 'prompt' : 'none'}`);
        return { action, prompt };
      },
      { legacyRoot: true },
    );

    let pending: Promise<ActionResult<void>> | undefined;
    act(() => {
      pending = result.current.action.run();
    });
    await vi.waitFor(() => expect(result.current.prompt).not.toBeNull());
    const view = render(<>{result.current.prompt?.content}</>);
    act(() => view.getByRole('button', { name: button }).click());
    afterRequest.resolve();
    await pending;
    await vi.waitFor(() => expect(result.current.prompt).toBeNull());

    const afterPrompt = renders.slice(renders.indexOf('running prompt'));
    expect(afterPrompt).not.toContain('running none');
    expect(afterPrompt.at(-1)).toBe('idle none');
  });

  it('turns a cancelled reverification into a cancelled result', async () => {
    const { pending } = await startNeedingReverification(() =>
      Promise.resolve({ reverificationLevel: 'second_factor' }),
    );

    await act(async () => {
      screen.getByRole('button', { name: 'Cancel' }).click();
      await expect(pending).resolves.toEqual({ status: 'cancelled' });
    });
    expect(challengeCancel).toHaveBeenCalledOnce();
  });

  it('cancels when the session changes during the challenge', async () => {
    const { rerender, pending } = await startNeedingReverification(() =>
      Promise.resolve({ reverificationLevel: 'first_factor' }),
    );

    session = { id: 'sess_2' };
    act(() => rerender());
    await expect(pending).resolves.toEqual({ status: 'cancelled' });
  });

  it('cancels when the session is signed out during the challenge', async () => {
    const { rerender, pending } = await startNeedingReverification(() =>
      Promise.resolve({ reverificationLevel: 'first_factor' }),
    );

    session = null;
    act(() => rerender());
    await expect(pending).resolves.toEqual({ status: 'cancelled' });
  });

  it('does not cancel when the session is briefly unloaded', async () => {
    const { result, rerender } = await startNeedingReverification(() =>
      Promise.resolve({ reverificationLevel: 'first_factor' }),
    );

    const previous = session;
    session = undefined;
    rerender();
    session = previous;
    rerender();

    expect(challengeCancel).not.toHaveBeenCalled();
    expect(result.current.action.state.status).toBe('running');
  });

  it('cancels the challenge when the owner unmounts', async () => {
    const { unmount, pending } = await startNeedingReverification(() =>
      Promise.resolve({ reverificationLevel: 'first_factor' }),
    );

    unmount();
    await expect(pending).resolves.toEqual({ status: 'cancelled' });
    expect(challengeCancel).toHaveBeenCalledOnce();
  });
});
