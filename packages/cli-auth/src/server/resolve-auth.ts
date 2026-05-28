import type { MachineTokenType } from '@clerk/backend/internal';

import { ClerkCliAuthError } from '../errors';
import type { Identity } from '../types';
import type { ResolveAuthInfoContext, TokenInfo } from './types';

/**
 * Canonical Clerk subject formats: `user_*`, `org_*`, `mch_*`, `scim_*` — each
 * followed by 27 word chars. Verified tokens should always match.
 */
const SUBJECT_PATTERN = /^(user|org|mch|scim)_\w{27}$/;

/** Extract a canonical Clerk subject from `tokenInfo.subject` or any claim that holds one. */
function extractSubject(tokenInfo: TokenInfo): string {
  if (SUBJECT_PATTERN.test(tokenInfo.subject)) {
    return tokenInfo.subject;
  }
  // Fallback: scan claims for the first canonical subject value.
  if (tokenInfo.claims) {
    for (const value of Object.values(tokenInfo.claims)) {
      if (typeof value === 'string' && SUBJECT_PATTERN.test(value)) {
        return value;
      }
    }
  }
  throw new ClerkCliAuthError(
    'verify_api_key',
    `Verified token has no canonical Clerk subject (got "${tokenInfo.subject}").`,
  );
}

/**
 * Default info resolver — runs on a verified `TokenInfo` and projects it into a
 * `Identity`. Validates the subject against `^(user|org|mch|scim)_\w{27}$`
 * to catch verifier output that doesn't look like a Clerk resource ID.
 *
 * Consumers override this by passing `resolveAuthInfo` to `handle()` when they want
 * richer profile/org data (e.g. fetching the user via the bound Clerk client, or
 * pulling org claims out of an API key's `claims` bag).
 */
export function resolveAuthInfo<T extends MachineTokenType>(ctx: ResolveAuthInfoContext<T>): Identity {
  const { tokenInfo } = ctx;
  const sub = extractSubject(tokenInfo);

  const info: Identity = { sub };

  // Pass through anything the verifier surfaced under `claims` — keeps the response useful
  // without forcing every consumer to write a resolver.
  if (tokenInfo.claims) {
    for (const [key, value] of Object.entries(tokenInfo.claims)) {
      if (info[key] === undefined) {
        info[key] = value;
      }
    }
  }

  return info;
}

/** Internal: enforces the `Identity` contract on whatever the resolver returned. */
export function validateIdentity(info: unknown): Identity {
  if (!info || typeof info !== 'object') {
    throw new ClerkCliAuthError(
      'verify_api_key',
      'resolveAuthInfo must return an Identity object with a non-empty `sub`.',
    );
  }
  const candidate = info as Partial<Identity>;
  if (typeof candidate.sub !== 'string' || !candidate.sub) {
    throw new ClerkCliAuthError(
      'verify_api_key',
      'resolveAuthInfo returned an object without a non-empty `sub` field.',
    );
  }
  return candidate as Identity;
}
