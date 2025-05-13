import { expectTypeOf } from 'vitest';

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
    type UseReverificationWithFetcher = typeof useReverification<typeof fetcher>;
    type VerifiedFetcher = ReturnType<UseReverificationWithFetcher>;
    expectTypeOf(fetcher).toEqualTypeOf<VerifiedFetcher>();
  });

  it('returned callback with clerk error excluded', () => {
    type UseReverificationWithFetcherHelperThrow = typeof useReverification<typeof fetcherWithHelper>;
    type VerifiedFetcherHelperThrow = ReturnType<UseReverificationWithFetcherHelperThrow>;
    expectTypeOf(fetcherWithHelper).not.toEqualTypeOf<VerifiedFetcherHelperThrow>();
    expectTypeOf<ExcludeClerkError<Awaited<ReturnType<Fetcher>>>>().toEqualTypeOf<
      Awaited<ReturnType<VerifiedFetcherHelperThrow>>
    >();
  });
});
