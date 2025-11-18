import type { __internal_ResourceCacheStableKey, ResourceCacheStableKey } from '../stable-keys';
import type { QueryKeyWithArgs } from './usePageOrInfinite.types';

/**
 * @internal
 */
export function createCacheKeys<
  Params,
  T extends Record<string, unknown> = Record<string, unknown>,
  U extends Record<string, unknown> | undefined = undefined,
>(params: {
  stablePrefix: ResourceCacheStableKey | __internal_ResourceCacheStableKey;
  authenticated: boolean;
  tracked: T;
  untracked: U extends { args: Params } ? U : never;
}) {
  return {
    queryKey: [params.stablePrefix, params.authenticated, params.tracked, params.untracked] as const,
    invalidationKey: [params.stablePrefix, params.authenticated, params.tracked] as const,
    stableKey: params.stablePrefix,
    authenticated: params.authenticated,
  };
}

export function toSWRQuery<T extends { queryKey: QueryKeyWithArgs<unknown> }>(keys: T) {
  const { queryKey } = keys;
  return {
    type: queryKey[0],
    ...queryKey[2],
    ...(queryKey[3] as { args: Record<string, unknown> }).args,
  };
}
