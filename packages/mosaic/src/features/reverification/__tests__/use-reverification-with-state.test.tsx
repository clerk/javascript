import { ClerkRuntimeError, isClerkRuntimeError, isReverificationCancelledError } from '@clerk/shared/error';
import type * as SharedReact from '@clerk/shared/react';
import type { SessionVerificationLevel } from '@clerk/shared/types';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deferred, tick } from '../../../machines/__tests__/test-utils';
import type { ReverificationState } from '../reverification.types';
import { useReverificationWithState } from '../use-reverification-with-state';

type NeedsReverificationParameters = {
  complete: () => void;
  cancel: () => void;
  level: SessionVerificationLevel | undefined;
};

type Hint = { reverificationLevel: SessionVerificationLevel | undefined };

const IN_PROGRESS = 'request_already_in_progress';

let session: { id: string } | null | undefined = { id: 'sess_1' };
let challengeCancel: ReturnType<typeof vi.fn>;

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

function assertActive(state: ReverificationState): asserts state is Extract<ReverificationState, { phase: 'active' }> {
  expect(state.phase).toBe('active');
  if (state.phase !== 'active') {
    throw new Error('expected active reverification');
  }
}

describe('useReverificationWithState', () => {
  beforeEach(() => {
    session = { id: 'sess_1' };
    challengeCancel = vi.fn();
  });

  it('returns the enhanced fetcher and stays inactive until reverification is needed', async () => {
    const fetcher = vi.fn((id: string) => Promise.resolve(id));
    const { result } = renderHook(() => useReverificationWithState(fetcher));

    expect(typeof result.current[0]).toBe('function');
    expect(result.current[1]).toEqual({ phase: 'inactive' });

    let value: string | undefined;
    await act(async () => {
      value = await result.current[0]('user');
    });

    expect(value).toBe('user');
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith('user');
    expect(result.current[1]).toEqual({ phase: 'inactive' });
  });

  it('moves inactive → active → retrying → inactive when the retry succeeds', async () => {
    const retry = deferred<{ ok: true }>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ reverificationLevel: 'first_factor' } satisfies Hint)
      .mockImplementationOnce(() => retry.promise);
    const { result } = renderHook(() => useReverificationWithState(fetcher));

    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));
    assertActive(result.current[1]);
    expect(result.current[1].level).toBe('first_factor');
    expect(fetcher).toHaveBeenCalledOnce();

    act(() => {
      assertActive(result.current[1]);
      result.current[1].complete();
    });
    await waitFor(() => expect(result.current[1]).toEqual({ phase: 'retrying' }));
    expect(fetcher).toHaveBeenCalledTimes(2);

    retry.resolve({ ok: true });
    await act(async () => {
      await expect(pending).resolves.toEqual({ ok: true });
    });
    await waitFor(() => expect(result.current[1]).toEqual({ phase: 'inactive' }));
    expect(challengeCancel).not.toHaveBeenCalled();
  });

  it('returns to inactive when the delayed retry fails', async () => {
    const retry = deferred<never>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ reverificationLevel: 'multi_factor' } satisfies Hint)
      .mockImplementationOnce(() => retry.promise);
    const { result } = renderHook(() => useReverificationWithState(fetcher));

    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));

    act(() => {
      assertActive(result.current[1]);
      result.current[1].complete();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('retrying'));

    retry.reject(new Error('Mock delete failed.'));
    await act(async () => {
      await expect(pending).rejects.toThrow('Mock delete failed.');
    });
    await waitFor(() => expect(result.current[1]).toEqual({ phase: 'inactive' }));
    expect(challengeCancel).not.toHaveBeenCalled();
  });

  it('returns directly to inactive when the active challenge is cancelled', async () => {
    const fetcher = vi.fn().mockResolvedValue({ reverificationLevel: undefined } satisfies Hint);
    const { result } = renderHook(() => useReverificationWithState(fetcher));

    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));

    act(() => {
      assertActive(result.current[1]);
      result.current[1].cancel();
    });

    await act(async () => {
      await expect(pending).rejects.toMatchObject({ code: 'reverification_cancelled' });
    });
    expect(isReverificationCancelledError(await pending.catch(error => error))).toBe(true);
    expect(result.current[1]).toEqual({ phase: 'inactive' });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(challengeCancel).toHaveBeenCalledOnce();
  });

  it('rejects a second call during the initial request without calling the fetcher again', async () => {
    const gate = deferred<string>();
    const fetcher = vi.fn(() => gate.promise);
    const { result } = renderHook(() => useReverificationWithState(fetcher));

    let first!: Promise<unknown>;
    act(() => {
      first = result.current[0]('first');
    });
    await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());

    await expect(result.current[0]('second')).rejects.toMatchObject({ code: IN_PROGRESS });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith('first');

    gate.resolve('done');
    await act(async () => {
      await expect(first).resolves.toBe('done');
    });
  });

  it('rejects a second call during verification and retry without calling the fetcher', async () => {
    const retry = deferred<string>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ reverificationLevel: 'first_factor' } satisfies Hint)
      .mockImplementationOnce(() => retry.promise);
    const { result } = renderHook(() => useReverificationWithState(fetcher));

    let first!: Promise<unknown>;
    act(() => {
      first = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));
    expect(fetcher).toHaveBeenCalledOnce();

    const duringVerification = await result.current[0]().then(
      () => {
        throw new Error('expected rejection');
      },
      error => error,
    );
    expect(isReverificationCancelledError(duringVerification)).toBe(false);
    expect(isClerkRuntimeError(duringVerification) && duringVerification.code).toBe(IN_PROGRESS);
    expect(fetcher).toHaveBeenCalledOnce();

    act(() => {
      assertActive(result.current[1]);
      result.current[1].complete();
    });
    await waitFor(() => expect(result.current[1]).toEqual({ phase: 'retrying' }));
    expect(fetcher).toHaveBeenCalledTimes(2);

    await expect(result.current[0]()).rejects.toMatchObject({ code: IN_PROGRESS });
    expect(fetcher).toHaveBeenCalledTimes(2);

    retry.resolve('ok');
    await act(async () => {
      await expect(first).resolves.toBe('ok');
    });
    await waitFor(() => expect(result.current[1]).toEqual({ phase: 'inactive' }));
  });

  it('starts another challenge after the first invocation settles', async () => {
    const retry = deferred<string>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ reverificationLevel: 'first_factor' } satisfies Hint)
      .mockImplementationOnce(() => retry.promise)
      .mockResolvedValueOnce({ reverificationLevel: 'multi_factor' } satisfies Hint);
    const { result } = renderHook(() => useReverificationWithState(fetcher));

    let first!: Promise<unknown>;
    act(() => {
      first = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));
    act(() => {
      assertActive(result.current[1]);
      result.current[1].complete();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('retrying'));

    retry.resolve('ok');
    await act(async () => {
      await expect(first).resolves.toBe('ok');
    });
    await waitFor(() => expect(result.current[1]).toEqual({ phase: 'inactive' }));

    act(() => {
      first = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));
    expect(result.current[1]).toMatchObject({ phase: 'active', level: 'multi_factor' });
    act(() => {
      assertActive(result.current[1]);
      result.current[1].cancel();
    });
    await act(async () => {
      await first.catch(() => undefined);
    });
  });

  it('cancels when the session changes while the challenge is active', async () => {
    const fetcher = vi.fn().mockResolvedValue({ reverificationLevel: 'first_factor' } satisfies Hint);
    const { result, rerender } = renderHook(() => useReverificationWithState(fetcher));

    let first!: Promise<unknown>;
    act(() => {
      first = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));

    const settled = expect(first).rejects.toMatchObject({ code: 'reverification_cancelled' });
    session = { id: 'sess_2' };
    rerender();
    await settled;
    expect(result.current[1]).toEqual({ phase: 'inactive' });
    expect(challengeCancel).toHaveBeenCalledOnce();
  });

  it('does not cancel when the session is briefly unloaded', async () => {
    const fetcher = vi.fn().mockResolvedValue({ reverificationLevel: 'first_factor' } satisfies Hint);
    const { result, rerender } = renderHook(() => useReverificationWithState(fetcher));

    let first!: Promise<unknown>;
    act(() => {
      first = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));

    const previous = session;
    session = undefined;
    rerender();
    session = previous;
    rerender();
    expect(challengeCancel).not.toHaveBeenCalled();
    expect(result.current[1].phase).toBe('active');

    act(() => {
      assertActive(result.current[1]);
      result.current[1].cancel();
    });
    await act(async () => {
      await first.catch(() => undefined);
    });
  });

  it('cancels when the session is signed out during the challenge', async () => {
    const fetcher = vi.fn().mockResolvedValue({ reverificationLevel: 'first_factor' } satisfies Hint);
    const { result, rerender } = renderHook(() => useReverificationWithState(fetcher));

    let first!: Promise<unknown>;
    act(() => {
      first = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));

    const settled = expect(first).rejects.toMatchObject({ code: 'reverification_cancelled' });
    session = null;
    rerender();
    await settled;
    expect(result.current[1]).toEqual({ phase: 'inactive' });
  });

  it('does not cancel a retry when the session changes', async () => {
    const retry = deferred<string>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ reverificationLevel: 'first_factor' } satisfies Hint)
      .mockImplementationOnce(() => retry.promise);
    const { result, rerender } = renderHook(() => useReverificationWithState(fetcher));

    let first!: Promise<unknown>;
    act(() => {
      first = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));
    act(() => {
      assertActive(result.current[1]);
      result.current[1].complete();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('retrying'));

    session = { id: 'sess_2' };
    rerender();
    await tick();
    expect(challengeCancel).not.toHaveBeenCalled();
    expect(result.current[1]).toEqual({ phase: 'retrying' });

    session = null;
    rerender();
    await tick();
    expect(challengeCancel).not.toHaveBeenCalled();
    expect(result.current[1]).toEqual({ phase: 'retrying' });

    retry.resolve('ok');
    await act(async () => {
      await expect(first).resolves.toBe('ok');
    });
  });

  it('cancels when the owner unmounts during the challenge', async () => {
    const fetcher = vi.fn().mockResolvedValue({ reverificationLevel: 'first_factor' } satisfies Hint);
    const { result, unmount } = renderHook(() => useReverificationWithState(fetcher));

    let first!: Promise<unknown>;
    act(() => {
      first = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));

    const settled = expect(first).rejects.toMatchObject({ code: 'reverification_cancelled' });
    unmount();
    await settled;
    expect(challengeCancel).toHaveBeenCalledOnce();
  });

  it('does not cancel when the owner unmounts during retry', async () => {
    const retry = deferred<string>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ reverificationLevel: 'first_factor' } satisfies Hint)
      .mockImplementationOnce(() => retry.promise);
    const { result, unmount } = renderHook(() => useReverificationWithState(fetcher));

    let first!: Promise<unknown>;
    act(() => {
      first = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));
    act(() => {
      assertActive(result.current[1]);
      result.current[1].complete();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('retrying'));

    unmount();
    await tick();
    expect(challengeCancel).not.toHaveBeenCalled();

    retry.resolve('ok');
    await expect(first).resolves.toBe('ok');
  });

  it('does not cancel again on unmount after the flow already settled', async () => {
    const fetcher = vi.fn().mockResolvedValue({ reverificationLevel: 'first_factor' } satisfies Hint);
    const { result, unmount } = renderHook(() => useReverificationWithState(fetcher));

    let first!: Promise<unknown>;
    act(() => {
      first = result.current[0]();
    });
    await waitFor(() => expect(result.current[1].phase).toBe('active'));
    act(() => {
      assertActive(result.current[1]);
      result.current[1].cancel();
    });
    await act(async () => {
      await first.catch(() => undefined);
    });
    expect(challengeCancel).toHaveBeenCalledOnce();

    unmount();
    expect(challengeCancel).toHaveBeenCalledOnce();
  });
});
