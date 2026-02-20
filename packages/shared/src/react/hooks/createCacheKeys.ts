import type { __internal_ResourceCacheStableKey, ResourceCacheStableKey } from '../stable-keys';

/**
 * @internal
 */
export function createCacheKeys<
  Params,
  T extends Record<string, unknown> = Record<string, unknown>,
  U extends Record<string, unknown> | undefined = undefined,
>(params: {
  stablePrefix: ResourceCacheStableKey | __internal_ResourceCacheStableKey;
  /**
   * Describes queries that will contain data that require a user to be authenticated.
   *
   * `authenticated` should be not be resolved at runtime.
   * When`authenticated: true` use it with `useClearQueriesOnSignOut` to automatically clear the cache entries associated with the cache key when a user signs out.
   */
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
