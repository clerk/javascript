import type { JWT, TokenResource } from '@clerk/shared/types';

function asJwt(input: TokenResource | JWT): JWT | undefined {
  return 'getRawString' in input ? input.jwt : input;
}

/**
 * Picks the freshest of two tokens. Returns whichever argument has the more
 * recent claim freshness. On a full tie (same oiat AND same iat) it returns
 * `incoming`, since two tokens with identical timestamps can still differ in
 * other claims (azp, org_id, etc.) during a token-format rollout, so the
 * guard should only suppress when existing is strictly fresher.
 *
 * All origin-minted tokens carry the `oiat` JWT header (origin-issued-at;
 * timestamp when claims were last assembled from the DB). A token without
 * `oiat` is from a pre-feature codebase and is by definition staler than any
 * token that has one.
 *
 * Used by the cross-tab broadcast handler in tokenCache to drop stale
 * edge-minted tokens that would otherwise clobber a fresher cached entry.
 *
 * @internal
 */
export function pickFreshestJwt<T extends TokenResource | JWT>(existing: T, incoming: T): T {
  const existingOiat = asJwt(existing)?.header?.oiat;
  const incomingOiat = asJwt(incoming)?.header?.oiat;

  if (existingOiat == null && incomingOiat == null) {
    return incoming;
  }
  if (incomingOiat == null) {
    return existing;
  }
  if (existingOiat == null) {
    return incoming;
  }

  if (existingOiat > incomingOiat) {
    return existing;
  }
  if (existingOiat < incomingOiat) {
    return incoming;
  }

  // Equal oiat: tie-break by iat (more recent mint wins). On a full tie,
  // return incoming: two tokens with identical oiat+iat may still differ
  // in other claims (azp, org_id, etc.) added in a token-format rollout,
  // so we only suppress when existing is strictly fresher.
  const existingIat = asJwt(existing)?.claims?.iat ?? 0;
  const incomingIat = asJwt(incoming)?.claims?.iat ?? 0;
  return existingIat > incomingIat ? existing : incoming;
}
