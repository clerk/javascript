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

export function tokenOiat(input: TokenResource | JWT): number | undefined {
  return asJwt(input)?.header?.oiat;
}

export function tokenSid(input: TokenResource | JWT): string | undefined {
  return asJwt(input)?.claims?.sid;
}

export function tokenOrgId(input: TokenResource | JWT): string {
  const claims = asJwt(input)?.claims;
  return (claims?.org_id as string) || ((claims?.o as { id?: string } | undefined)?.id ?? '');
}

export function normalizeOrgId(orgId?: string | null): string {
  return orgId || '';
}

export function pickFreshestOrIncoming<T extends TokenResource | JWT>(existing: T | null | undefined, incoming: T): T {
  return existing == null ? incoming : pickFreshestJwt(existing, incoming);
}

// The single drop/keep primitive. True ONLY when both carry oiat and `incoming` is
// strictly older. Missing oiat (either side) or a full oiat+iat tie => false (fail open).
export function isStrictlyStalerJwt(incoming: TokenResource | JWT, baseline: TokenResource | JWT): boolean {
  const i = tokenOiat(incoming);
  const b = tokenOiat(baseline);
  if (i == null || b == null) {
    return false;
  }
  if (i < b) {
    return true;
  }
  if (i > b) {
    return false;
  }
  const iIat = asJwt(incoming)?.claims?.iat ?? 0;
  const bIat = asJwt(baseline)?.claims?.iat ?? 0;
  return iIat < bIat;
}
