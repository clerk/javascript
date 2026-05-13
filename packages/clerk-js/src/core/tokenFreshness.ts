import type { JWT, TokenResource } from '@clerk/shared/types';

function asJwt(input: TokenResource | JWT): JWT | undefined {
  return 'getRawString' in input ? input.jwt : input;
}

/**
 * Determines whether an incoming token should be rejected in favor of the existing one.
 * Returns true if the incoming token is staler than the existing one. Accepts either
 * TokenResource (cache layer) or a raw decoded JWT (cookie layer).
 *
 * All origin-minted tokens now carry the `oiat` JWT header (origin-issued-at; the
 * timestamp when token claims were last assembled from the DB). A token without
 * `oiat` is from a pre-feature codebase and is by definition staler than any
 * token that has one.
 *
 * Coverage: enforced at /tokens responses, broadcast events, and cookie writes.
 * Handshake-installed __session cookies are intentionally NOT gated here:
 * handshake is a redirect-based full auth state resync, the browser commits the
 * Set-Cookie before any SDK code runs, and there is no in-flight race window
 * for the gate to protect.
 *
 * @internal
 */
export function shouldRejectToken(
  existing: TokenResource | JWT,
  incoming: TokenResource | JWT,
): boolean {
  const existingOiat = asJwt(existing)?.header?.oiat;
  const incomingOiat = asJwt(incoming)?.header?.oiat;

  // Missing oiat = pre-feature stale token. The oiat-bearing side always wins.
  if (incomingOiat == null && existingOiat == null) {
    return false;
  }
  if (incomingOiat == null) {
    return true;
  }
  if (existingOiat == null) {
    return false;
  }

  if (existingOiat > incomingOiat) {
    return true;
  }
  if (existingOiat < incomingOiat) {
    return false;
  }

  // Equal oiat: tie-break by iat (more recent mint wins). Equal iat: keep
  // existing (identical, no reason to replace).
  const existingIat = asJwt(existing)?.claims?.iat ?? 0;
  const incomingIat = asJwt(incoming)?.claims?.iat ?? 0;
  return existingIat >= incomingIat;
}
