import type { PagesOrInfiniteConfig, PagesOrInfiniteOptions, PaginatedResources } from '../types';

export type ArrayType<DataArray> = DataArray extends Array<infer ElementType> ? ElementType : never;

export type ExtractData<Type> = Type extends { data: infer Data } ? ArrayType<Data> : Type;

export type UsePagesOrInfiniteSignature = <
  Params extends PagesOrInfiniteOptions,
  FetcherReturnData extends Record<string, any>,
  CacheKeys extends Record<string, unknown> = Record<string, unknown>,
  TConfig extends PagesOrInfiniteConfig = PagesOrInfiniteConfig,
>(
  params: Params,
  fetcher: ((p: Params) => FetcherReturnData | Promise<FetcherReturnData>) | undefined,
  config: TConfig,
  cacheKeys: CacheKeys,
) => PaginatedResources<ExtractData<FetcherReturnData>, TConfig['infinite']>;
