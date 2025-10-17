import { act, renderHook } from '@testing-library/react';
import { expectTypeOf } from 'expect-type';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reverificationError } from '../../authorization-errors';
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
});
