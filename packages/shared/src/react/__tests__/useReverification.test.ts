import { expectTypeOf } from 'expect-type';

import { reverificationError } from '../../authorization-errors';
import type { useReverification } from '../hooks/useReverification';

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
    type UseReverificationWithFetcher = typeof useReverification<typeof fetcher, object>;
    type VerifiedFetcher = ReturnType<UseReverificationWithFetcher>[0];
    expectTypeOf(fetcher).toEqualTypeOf<VerifiedFetcher>();
  });

  it('returned callback with clerk error excluded and possible null in case of cancelled flow', () => {
    type UseReverificationWithFetcherHelper = typeof useReverification<typeof fetcherWithHelper, object>;
    type VerifiedFetcherHelper = ReturnType<UseReverificationWithFetcherHelper>[0];

    expectTypeOf(fetcherWithHelper).not.toEqualTypeOf<VerifiedFetcherHelper>();

    expectTypeOf<Parameters<Fetcher>>().toEqualTypeOf<Parameters<VerifiedFetcherHelper>>();
    expectTypeOf<ReturnType<Fetcher>>().not.toEqualTypeOf<ReturnType<VerifiedFetcherHelper>>();
    expectTypeOf<ExcludeClerkError<Awaited<ReturnType<Fetcher>>> | null>().toEqualTypeOf<
      Awaited<ReturnType<VerifiedFetcherHelper>>
    >();
  });

  it('returned callback with clerk error excluded but without null since we throw', () => {
    type UseReverificationWithFetcherHelperThrow = typeof useReverification<
      typeof fetcherWithHelper,
      {
        throwOnCancel: true;
      }
    >;
    type VerifiedFetcherHelperThrow = ReturnType<UseReverificationWithFetcherHelperThrow>[0];
    expectTypeOf(fetcherWithHelper).not.toEqualTypeOf<VerifiedFetcherHelperThrow>();
    expectTypeOf<ExcludeClerkError<Awaited<ReturnType<Fetcher>>>>().toEqualTypeOf<
      Awaited<ReturnType<VerifiedFetcherHelperThrow>>
    >();
  });
});
