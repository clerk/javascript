import type { PagesOrInfiniteConfig, PagesOrInfiniteOptions, PaginatedResources } from '../types';

export type ArrayType<DataArray> = DataArray extends Array<infer ElementType> ? ElementType : never;

export type ExtractData<Type> = Type extends { data: infer Data } ? ArrayType<Data> : Type;

// export type UsePagesOrInfiniteSignature = <
//   Params extends PagesOrInfiniteOptions,
//   FetcherReturnData extends Record<string, any>,
//   TCacheKeys extends {
//     stableKey: string;
//     trackedKeys: {
//       [key: string]: unknown;
//       args?: Record<string, unknown>;
//     };
//     untrackedKeys: {
//       [key: string]: unknown;
//       args?: Record<string, unknown>;
//     };
//   },
//   CacheKeys extends Record<string, unknown> = Record<string, unknown>,
//   TConfig extends PagesOrInfiniteConfig = PagesOrInfiniteConfig,
// >(
//   /**
//    * The parameters will be passed to the fetcher.
//    */
//   params: Params,
//   /**
//    * A Promise returning function to fetch your data.
//    */
//   fetcher: ((p: Params) => FetcherReturnData | Promise<FetcherReturnData>) | undefined,
//   acacheKeys: TCacheKeys,
//   /**
//    * Internal configuration of the hook.
//    */
//   config: TConfig,
//   cacheKeys: CacheKeys,
// ) => PaginatedResources<ExtractData<FetcherReturnData>, TConfig['infinite']>;

type Config = PagesOrInfiniteConfig & PagesOrInfiniteOptions;

interface Register {
  /**
   * Placeholder field to satisfy lint rules; actual shape is provided via declaration merging.
   */
  __clerkPaginationQueryKeyArgs?: never;
}

type AnyQueryKey = Register extends {
  queryKey: infer TQueryKey;
}
  ? TQueryKey extends ReadonlyArray<unknown>
    ? TQueryKey
    : TQueryKey extends Array<unknown>
      ? Readonly<TQueryKey>
      : ReadonlyArray<unknown>
  : ReadonlyArray<unknown>;

type QueryArgs<Params> = Readonly<{
  args: Params;
}>;

type QueryKeyWithArgs<Params> = readonly [
  string,
  boolean,
  Record<string, unknown>,
  QueryArgs<Params>,
  ...Array<unknown>,
];

export type UsePagesOrInfiniteSignature = <
  Params,
  FetcherReturnData extends Record<string, any>,
  TCacheKeys extends {
    queryKey: QueryKeyWithArgs<Params>;
    invalidationKey: AnyQueryKey;
    stableKey: string;
  },
  // CacheKeys extends Record<string, unknown> = Record<string, unknown>,
  TConfig extends Config = Config,
>(
  // /**
  //  * The parameters will be passed to the fetcher.
  //  */
  // params: Params,
  // /**
  //  * A Promise returning function to fetch your data.
  //  */
  // fetcher: ((p: Params) => FetcherReturnData | Promise<FetcherReturnData>) | undefined,
  // acacheKeys: TCacheKeys,
  // /**
  //  * Internal configuration of the hook.
  //  */
  // config: TConfig,
  // cacheKeys: CacheKeys,
  params: {
    fetcher: ((p: Params) => FetcherReturnData | Promise<FetcherReturnData>) | undefined;
    config: TConfig;
    keys: TCacheKeys;
  },
) => PaginatedResources<ExtractData<FetcherReturnData>, TConfig['infinite']>;
