/**
 * @internal
 */
export function createCacheKeys<
  Params,
  StableKey extends string,
  T extends Record<string, unknown> = Record<string, unknown>,
  U extends Record<string, unknown> | undefined = undefined,
>(params: {
  stablePrefix: StableKey;
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
