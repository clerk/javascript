import type { PagesOrInfiniteConfig, PagesOrInfiniteOptions, PaginatedResources } from '../types';

export type ArrayType<DataArray> = DataArray extends Array<infer ElementType> ? ElementType : never;

export type ExtractData<Type> = Type extends { data: infer Data } ? ArrayType<Data> : Type;

type Config = PagesOrInfiniteConfig & PagesOrInfiniteOptions;

type QueryArgs<Params> = Readonly<{
  args: Params;
}>;

export type QueryKeyWithArgs<Params> = readonly [
  string,
  boolean,
  Record<string, unknown>,
  QueryArgs<Params>,
  ...Array<unknown>,
];

type InvalidationQueryKey = readonly [string, boolean, Record<string, unknown>];

export type UsePagesOrInfiniteSignature = <
  Params,
  FetcherReturnData extends Record<string, any>,
  TCacheKeys extends {
    queryKey: QueryKeyWithArgs<Params>;
    invalidationKey: InvalidationQueryKey;
    stableKey: string;
    authenticated: boolean;
  },
  TConfig extends Config = Config,
>(params: {
  fetcher: ((p: Params) => FetcherReturnData | Promise<FetcherReturnData>) | undefined;
  config: TConfig;
  keys: TCacheKeys;
}) => PaginatedResources<ExtractData<FetcherReturnData>, TConfig['infinite']>;
