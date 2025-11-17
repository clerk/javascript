import type { PagesOrInfiniteConfig, PagesOrInfiniteOptions, PaginatedResources } from '../types';

export type ArrayType<DataArray> = DataArray extends Array<infer ElementType> ? ElementType : never;

export type ExtractData<Type> = Type extends { data: infer Data } ? ArrayType<Data> : Type;

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
  TConfig extends Config = Config,
>(params: {
  fetcher: ((p: Params) => FetcherReturnData | Promise<FetcherReturnData>) | undefined;
  config: TConfig;
  keys: TCacheKeys;
}) => PaginatedResources<ExtractData<FetcherReturnData>, TConfig['infinite']>;
