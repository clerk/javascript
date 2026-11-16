import { act, renderHook } from '@testing-library/react';
import { expectTypeOf } from 'expect-type';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reverificationError } from '../../authorization-errors';
import type { ReverificationPrefill, ReverificationResult } from '../../types';
import { useClerk } from '../hooks/useClerk';
import type { UseReverificationOptions, UseReverificationWithResultOptions } from '../hooks/useReverification';
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
describe('useReverification forwarded options type tests', () => {
  it('accepts options typed as UseReverificationOptions, required or optional', () => {
    const useForwarded = (options: UseReverificationOptions) => useReverificationImp(fetcher, options);
    const useForwardedOptional = (options?: UseReverificationOptions) => useReverificationImp(fetcher, options);
    expectTypeOf(useForwarded).returns.toEqualTypeOf(fetcher);
    expectTypeOf(useForwardedOptional).returns.toEqualTypeOf(fetcher);
  });
});

describe('useReverification passReverificationResult type tests', () => {
  it('infers the result parameter and drops it, required or optional, from the returned function', () => {
    const useRequired = () =>
      useReverificationImp(
        (reverification, key: string) => {
          expectTypeOf(reverification).toEqualTypeOf<ReverificationResult | undefined>();
          return Promise.resolve({ key });
        },
        { passReverificationResult: true },
      );
    const useOptional = () =>
      useReverificationImp((_reverification, key?: string) => Promise.resolve({ key }), {
        passReverificationResult: true,
      });

    expectTypeOf(useRequired).returns.parameters.toEqualTypeOf<[key: string]>();
    expectTypeOf(useRequired).returns.returns.resolves.toEqualTypeOf<{ key: string }>();
    expectTypeOf(useOptional).returns.parameters.toEqualTypeOf<[key?: string]>();
  });

  it('rejects the option on a fetcher that does not take the result first', () => {
    const useMismatch = () =>
      // @ts-expect-error the first parameter must accept the reverification result
      useReverificationImp((key: string) => Promise.resolve({ key }), { passReverificationResult: true });
    expectTypeOf(useMismatch).toBeFunction();
  });

  it('types prefill with the arguments of the returned function', () => {
    const useWithResult = () =>
      useReverificationImp((_reverification, key: string) => Promise.resolve({ key }), {
        passReverificationResult: true,
        prefill: key => {
          expectTypeOf(key).toEqualTypeOf<string>();
          return undefined;
        },
      });
    const useWithoutResult = () =>
      useReverificationImp((key: string) => Promise.resolve({ key }), {
        prefill: key => {
          expectTypeOf(key).toEqualTypeOf<string>();
          return undefined;
        },
      });
    expectTypeOf(useWithResult).toBeFunction();
    expectTypeOf(useWithoutResult).toBeFunction();
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

  // The runtime signature, whichever overload a caller's options select.
  const useAnyReverification = useReverificationImp as (
    fetcher: (...args: any[]) => Promise<any>,
    options?: UseReverificationOptions | UseReverificationWithResultOptions,
  ) => (...args: any[]) => Promise<any>;

  describe('passReverificationResult', () => {
    const passwordReset = { newPassword: 'new-password-123', signOutOfOtherSessions: true };

    // Calls the hook once: the first fetcher call needs reverification, which completes with `result`.
    const callWithReverification = async (
      options: UseReverificationOptions | UseReverificationWithResultOptions,
      result?: ReverificationResult,
    ) => {
      const fetchSpy = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValueOnce({ ok: true });
      const { result: hook } = renderHook(() =>
        useAnyReverification(fetchSpy, { ...options, onNeedsReverification: ({ complete }) => complete(result) }),
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

  describe('prefill', () => {
    const prefillValues: ReverificationPrefill = { newPassword: 'new-password-123', signOutOfOtherSessions: false };
    const openReverification = vi.mocked(useClerk().__internal_openReverification);

    beforeEach(() => {
      openReverification.mockReset();
    });

    it('passes the values for the request to the default modal', async () => {
      openReverification.mockImplementation(props => props?.afterVerification?.());
      const fetchSpy = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValueOnce({ ok: true });
      const prefill = vi.fn().mockReturnValue(prefillValues);
      const { result: hook } = renderHook(() => useAnyReverification(fetchSpy, { prefill }));

      await act(async () => {
        await hook.current('arg', 2);
      });

      expect(prefill).toHaveBeenCalledExactlyOnceWith('arg', 2);
      expect(openReverification).toHaveBeenCalledWith(
        expect.objectContaining({ resetPassword: { password: 'new-password-123', signOutOfOtherSessions: false } }),
      );
    });

    it('passes the values to a custom handler', async () => {
      const fetchSpy = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValueOnce({ ok: true });
      const onNeedsReverification = vi.fn(({ complete }) => complete());
      const { result: hook } = renderHook(() =>
        useAnyReverification(fetchSpy, { prefill: () => prefillValues, onNeedsReverification }),
      );

      await act(async () => {
        await hook.current('arg');
      });

      expect(onNeedsReverification).toHaveBeenCalledWith(expect.objectContaining({ prefill: prefillValues }));
      expect(openReverification).not.toHaveBeenCalled();
    });

    it('gets the request arguments, not the result, alongside passReverificationResult', async () => {
      const fetchSpy = vi
        .fn<(reverification: ReverificationResult | undefined, key: string) => Promise<unknown>>()
        .mockResolvedValueOnce(reverificationError())
        .mockResolvedValueOnce({ ok: true });
      const prefill = vi.fn((_key: string) => prefillValues);
      const passwordReset = { newPassword: 'new-password-123', signOutOfOtherSessions: false };
      const { result: hook } = renderHook(() =>
        useReverificationImp(fetchSpy, {
          passReverificationResult: true,
          prefill,
          onNeedsReverification: ({ complete }) => complete({ passwordReset }),
        }),
      );

      await act(async () => {
        await hook.current('arg');
      });

      expect(prefill).toHaveBeenCalledExactlyOnceWith('arg');
      expect(fetchSpy).toHaveBeenNthCalledWith(2, { passwordReset }, 'arg');
    });

    it('opens the modal without values when prefill returns none', async () => {
      openReverification.mockImplementation(props => props?.afterVerification?.());
      const fetchSpy = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValueOnce({ ok: true });
      const { result: hook } = renderHook(() => useAnyReverification(fetchSpy, { prefill: () => undefined }));

      await act(async () => {
        await hook.current('arg');
      });

      expect(openReverification).toHaveBeenCalledOnce();
      expect(openReverification.mock.calls[0][0]?.resetPassword).toBeUndefined();
    });

    it('is not called when the request needs no reverification', async () => {
      const prefill = vi.fn();
      const { result: hook } = renderHook(() =>
        useAnyReverification(vi.fn().mockResolvedValue({ ok: true }), { prefill }),
      );

      await act(async () => {
        await hook.current('arg');
      });

      expect(prefill).not.toHaveBeenCalled();
      expect(openReverification).not.toHaveBeenCalled();
    });
  });
});
