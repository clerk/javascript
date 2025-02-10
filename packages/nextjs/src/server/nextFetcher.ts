type Fetcher = typeof globalThis.fetch;

/**
 * Based on nextjs internal implementation https://github.com/vercel/next.js/blob/6185444e0a944a82e7719ac37dad8becfed86acd/packages/next/src/server/lib/patch-fetch.ts#L23
 */
type NextFetcher = Fetcher & {
  readonly __nextPatched: true;
  readonly __nextGetStaticStore: () => { getStore: () => StaticGenerationAsyncStorage | undefined };
};

/**
 * Full type can be found https://github.com/vercel/next.js/blob/6185444e0a944a82e7719ac37dad8becfed86acd/packages/next/src/client/components/static-generation-async-storage.external.ts#L4
 */
interface StaticGenerationAsyncStorage {
  /**
   * Available for Next 14
   */
  readonly pagePath?: string;
  /**
   * Available for Next 15
   */
  readonly page?: string;
}

function isNextFetcher(fetch: Fetcher | NextFetcher): fetch is NextFetcher {
  return '__nextPatched' in fetch && fetch.__nextPatched === true;
}

export { isNextFetcher };
