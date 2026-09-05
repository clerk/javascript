import type * as SharedReact from '@clerk/shared/react';
import type { SessionVerificationLevel } from '@clerk/shared/types';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useReverificationWithState } from '../use-reverification-with-state';

type NeedsReverificationParameters = {
  complete: () => void;
  cancel: () => void;
  level: SessionVerificationLevel | undefined;
};

let capturedOnNeeds: ((params: NeedsReverificationParameters) => void) | undefined;
let session: { id: string } | null | undefined = { id: 'sess_1' };
const wrapped = vi.fn();

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useSession: () => ({ session }),
    useReverification: (_fetcher: unknown, options?: { onNeedsReverification?: (params: NeedsReverificationParameters) => void }) => {
      capturedOnNeeds = options?.onNeedsReverification;
      return wrapped;
    },
  };
});

const fetcher = async (id: string) => id;

describe('useReverificationWithState', () => {
  beforeEach(() => {
    capturedOnNeeds = undefined;
    session = { id: 'sess_1' };
    wrapped.mockReset();
  });

  it('returns the enhanced fetcher and is idle until reverification is needed', () => {
    const { result } = renderHook(() => useReverificationWithState(fetcher));
    const [callback, state] = result.current;

    expect(callback).toBe(wrapped);
    expect(state.isActive).toBe(false);
    expect(state.complete).toBeUndefined();
    expect(state.cancel).toBeUndefined();
    expect(state.level).toBeUndefined();
  });

  it('surfaces complete, cancel, and level when useReverification needs reverification', () => {
    const { result } = renderHook(() => useReverificationWithState(fetcher));
    const complete = vi.fn();
    const cancel = vi.fn();

    act(() => {
      capturedOnNeeds?.({ complete, cancel, level: 'first_factor' });
    });

    const [, state] = result.current;
    expect(state.isActive).toBe(true);
    if (!state.isActive) {
      throw new Error('expected active reverification state');
    }
    expect(state.level).toBe('first_factor');

    act(() => {
      state.complete();
    });

    expect(complete).toHaveBeenCalledOnce();
    expect(result.current[1].isActive).toBe(false);
  });

  it('returns to idle after cancel and calls the state cancel', () => {
    const { result } = renderHook(() => useReverificationWithState(fetcher));
    const complete = vi.fn();
    const cancel = vi.fn();

    act(() => {
      capturedOnNeeds?.({ complete, cancel, level: undefined });
    });

    act(() => {
      const [, state] = result.current;
      if (state.isActive) {
        state.cancel();
      }
    });

    expect(cancel).toHaveBeenCalledOnce();
    expect(complete).not.toHaveBeenCalled();
    expect(result.current[1].isActive).toBe(false);
  });

  it('cancels when the session changes after reverification opens', async () => {
    const { result, rerender } = renderHook(() => useReverificationWithState(fetcher));
    const cancel = vi.fn();

    act(() => {
      capturedOnNeeds?.({ complete: vi.fn(), cancel, level: 'first_factor' });
    });
    expect(result.current[1].isActive).toBe(true);

    session = { id: 'sess_2' };
    rerender();
    await waitFor(() => expect(cancel).toHaveBeenCalledOnce());
    expect(result.current[1].isActive).toBe(false);
  });

  it('does not cancel when the session is briefly unloaded', async () => {
    const { rerender } = renderHook(() => useReverificationWithState(fetcher));
    const cancel = vi.fn();

    act(() => {
      capturedOnNeeds?.({ complete: vi.fn(), cancel, level: 'first_factor' });
    });

    const previous = session;
    session = undefined;
    rerender();
    session = previous;
    rerender();
    expect(cancel).not.toHaveBeenCalled();
  });

  it('cancels when the session is signed out', async () => {
    const { result, rerender } = renderHook(() => useReverificationWithState(fetcher));
    const cancel = vi.fn();

    act(() => {
      capturedOnNeeds?.({ complete: vi.fn(), cancel, level: 'first_factor' });
    });

    session = null;
    rerender();
    await waitFor(() => expect(cancel).toHaveBeenCalledOnce());
    expect(result.current[1].isActive).toBe(false);
  });
});
