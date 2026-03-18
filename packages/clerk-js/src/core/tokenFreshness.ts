import type { JWT, TokenResource } from '@clerk/shared/types';

/**
 * Returns the claim freshness of a token or raw JWT.
 *
 * - If the token has `oiat` (JWT header): that's when claims were last assembled from the DB.
 *   Edge re-mints copy this value forward, so iat can be recent while oiat is old.
 * - If the token has no `oiat`: it's origin-minted (coupled FF means no Session Minter),
 *   so iat IS when claims were last read from the DB.
 *
 * @internal
 */
export function claimFreshness(input: TokenResource | JWT | undefined | null): number | undefined {
  if (!input) {
    return undefined;
  }
  // TokenResource has .jwt wrapping the JWT; raw JWT has .header directly
  const jwt = 'getRawString' in input ? input.jwt : input;
  return jwt?.header?.oiat ?? jwt?.claims?.iat;
}

/**
 * Determines whether an incoming token should be rejected in favor of the existing one.
 * Returns true if the incoming token is staler than the existing one.
 *
 * @internal
 */
export function shouldRejectToken(existing: TokenResource, incoming: TokenResource): boolean {
  const existingFreshness = claimFreshness(existing);
  const incomingFreshness = claimFreshness(incoming);

  // Can't determine freshness: accept incoming as safe default
  if (existingFreshness == null || incomingFreshness == null) {
    return false;
  }

  // Different freshness: the fresher token wins
  if (existingFreshness > incomingFreshness) {
    return true;
  }
  if (existingFreshness < incomingFreshness) {
    return false;
  }

  // Equal freshness: tie-break depends on regime
  const existingHasOiat = existing.jwt?.header?.oiat != null;
  const incomingHasOiat = incoming.jwt?.header?.oiat != null;
  const sameRegime = existingHasOiat === incomingHasOiat;

  if (sameRegime) {
    // Same regime, equal freshness.
    // Both have oiat: tie-break by iat (more recent mint wins). Equal iat: keep existing.
    // Neither has oiat: both origin, same DB snapshot. Keep existing (avoid churn).
    const existingIat = existing.jwt?.claims?.iat ?? 0;
    const incomingIat = incoming.jwt?.claims?.iat ?? 0;
    return existingIat >= incomingIat;
  }

  // Different regimes, equal freshness. Transition is happening. Favor incoming.
  return false;
}
