import { act, renderHook } from '@testing-library/react';
import { expectTypeOf } from 'expect-type';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reverificationError } from '../../authorization-errors';
import type { ReverificationResult } from '../../types';
import type { UseReverificationOptions } from '../hooks/useReverification';
import { useReverification as useReverificationImp } from '../hooks/useReverification';

vi.mock('../hooks/useClerk', () => {
  const mockClerk = {
    __internal_openReverification: vi.fn(),
    telemetry: { record: vi.fn() },
  };
  return {
    useClerk: () => mockClerk,
  };
});

type ExcludeClerkError<T> = T extends { clerk_error: any } ? never : T;

const fetcher = async (key: string, options: { id: string }) => {
  return {
    key,
    options,
  };
};

const fetcherWithHelper = async (key: string, options: { id: string }) => {
  if (key == 'a') {
    return reverificationError();
  }

  return {
    key,
    options,
  };
};

type Fetcher = typeof fetcherWithHelper;

describe('useReverification type tests', () => {
  it('allow pass through types', () => {
    type UseReverificationWithFetcher = typeof useReverificationImp<typeof fetcher>;
    type VerifiedFetcher = ReturnType<UseReverificationWithFetcher>;
    expectTypeOf(fetcher).toEqualTypeOf<VerifiedFetcher>();
  });

  it('returned callback with clerk error excluded', () => {
    type UseReverificationWithFetcherHelperThrow = typeof useReverificationImp<typeof fetcherWithHelper>;
    type VerifiedFetcherHelperThrow = ReturnType<UseReverificationWithFetcherHelperThrow>;
    expectTypeOf(fetcherWithHelper).not.toEqualTypeOf<VerifiedFetcherHelperThrow>();
    expectTypeOf<ExcludeClerkError<Awaited<ReturnType<Fetcher>>>>().toEqualTypeOf<
      Awaited<ReturnType<VerifiedFetcherHelperThrow>>
    >();
  });
});
describe('useReverification passReverificationResult type tests', () => {
  it('drops the first fetcher parameter, required or optional, from the returned function', () => {
    type Required = (reverification: ReverificationResult | undefined, key: string) => Promise<{ key: string }>;
    type Optional = (reverification?: ReverificationResult, key?: string) => Promise<{ key?: string }>;
    type Returned<F extends Required | Optional> = ReturnType<
      typeof useReverificationImp<F, { passReverificationResult: true }>
    >;
    expectTypeOf<Parameters<Returned<Required>>>().toEqualTypeOf<[key: string]>();
    expectTypeOf<Parameters<Returned<Optional>>>().toEqualTypeOf<[key?: string]>();
  });
});

describe('useReverification', () => {
  const mockFetcherInner = vi.fn().mockResolvedValue({ ok: true });

  beforeEach(() => {
    mockFetcherInner.mockClear();
  });

  it('returns a stable function reference across re-renders when fetcher is stable', () => {
    const stableFetcher = vi.fn().mockResolvedValue({ data: 'test' });
    const { result, rerender } = renderHook(() => useReverificationImp(stableFetcher));
    const firstResult = result.current;

    rerender();

    const secondResult = result.current;

    expect(secondResult).toBe(firstResult);
  });

  it('keeps the same handler even when an inline fetcher changes on every render', async () => {
    const fetchSpy = vi.fn(async v => ({ v }));
    const { result, rerender } = renderHook(({ value }) => useReverificationImp(() => fetchSpy(value)), {
      initialProps: { value: 'A' },
    });
    const firstHandler = result.current;

    rerender({ value: 'B' });
    const secondHandler = result.current;

    expect(secondHandler).toBe(firstHandler);

    await act(async () => {
      await secondHandler();
    });
    expect(fetchSpy).toHaveBeenCalledWith('B');
  });

  describe('passReverificationResult', () => {
    const passwordReset = { newPassword: 'new-password-123', signOutOfOtherSessions: true };

    // Calls the hook once: the first fetcher call needs reverification, which completes with `result`.
    const callWithReverification = async (options: UseReverificationOptions, result?: ReverificationResult) => {
      const fetchSpy = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValueOnce({ ok: true });
      const { result: hook } = renderHook(() =>
        useReverificationImp(fetchSpy, { ...options, onNeedsReverification: ({ complete }) => complete(result) }),
      );
      await act(async () => {
        await hook.current('arg');
      });
      return fetchSpy;
    };

    it('passes undefined first, then the result given to complete, on the retry', async () => {
      const fetchSpy = await callWithReverification({ passReverificationResult: true }, { passwordReset });

      expect(fetchSpy).toHaveBeenNthCalledWith(1, undefined, 'arg');
      expect(fetchSpy).toHaveBeenNthCalledWith(2, { passwordReset }, 'arg');
    });

    it('passes undefined on the retry when complete gets no result', async () => {
      const fetchSpy = await callWithReverification({ passReverificationResult: true });

      expect(fetchSpy).toHaveBeenNthCalledWith(2, undefined, 'arg');
    });

    it('calls the fetcher with only its own arguments without the option', async () => {
      const fetchSpy = await callWithReverification({}, { passwordReset });

      expect(fetchSpy).toHaveBeenNthCalledWith(1, 'arg');
      expect(fetchSpy).toHaveBeenNthCalledWith(2, 'arg');
    });
  });
});
