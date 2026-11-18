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
 * Returns `incoming` when `existing` is null/undefined (no baseline yet), so a
 * caller with an optional baseline (a cache miss, a not-yet-set token) can pass
 * it straight through.
 *
 * @internal
 */
export function pickFreshestJwt<T extends TokenResource | JWT>(existing: T | null | undefined, incoming: T): T {
  if (existing == null) {
    return incoming;
  }

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

// Mirrors the cookie guard: only a same session+org lastActiveToken is a comparable
// freshness baseline, so a session or org switch always adopts the incoming token.
// Without this, an org-switch token minted by a stale edge (lower oiat) would lose
// to the previous org's token and pin lastActiveToken to the old org's claims.
export function shouldKeepExistingLastActiveToken(
  current: TokenResource | null | undefined,
  incoming: TokenResource,
): boolean {
  if (!current?.jwt) {
    return false;
  }
  if (tokenSid(current) !== tokenSid(incoming) || tokenOrgId(current) !== tokenOrgId(incoming)) {
    return false;
  }
  return pickFreshestJwt(current, incoming) !== incoming;
}
