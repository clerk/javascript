import { logger } from '@clerk/shared/logger';
import type { ProtectAssertion } from '@clerk/shared/types';

/**
 * The request param carrying a Protect assertion.
 *
 * Deliberately the same name as the cookie that can carry it instead: it is the same value by
 * another road, and one name means one thing to search for when working out why an assertion
 * did not apply.
 */
export const PROTECT_ASSERTION_PARAM = '__clerk_protect_assertion';

/**
 * Resolves the configured assertion for one request.
 *
 * A function is called per request rather than once at configuration time, so an app that
 * refreshes its token while the page is open does not have to re-configure Clerk for the new
 * one to take effect.
 *
 * Nothing here can fail a sign-in. A resolver that throws, rejects, or returns something other
 * than a non-empty string yields no assertion and a warning — the request proceeds without it,
 * because an assertion may influence a sign-in and must never prevent one.
 */
export async function resolveProtectAssertion(assertion: ProtectAssertion | undefined): Promise<string | undefined> {
  if (assertion === undefined) {
    return undefined;
  }

  let value: unknown = assertion;
  if (typeof assertion === 'function') {
    try {
      value = await assertion();
    } catch (error) {
      logger.warnOnce(`Clerk: protectAssertion resolver failed, continuing without it: ${error}`);
      return undefined;
    }
  }

  // `undefined` is the documented way to say "no assertion right now", so it is not worth a
  // warning; anything else is a mistake the developer wants to hear about.
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string' || value.trim() === '') {
    logger.warnOnce('Clerk: protectAssertion must be a non-empty string; ignoring it.');
    return undefined;
  }

  return value;
}

/**
 * The Protect params to merge into a sign-in or sign-up request body, or `undefined` when
 * there is nothing to add.
 *
 * Returning `undefined` rather than an empty object matters: the caller only touches the body
 * when there is something to put in it, so a request with no assertion is byte-for-byte the
 * request that would have been sent before.
 */
export async function protectAssertionParams(
  assertion: ProtectAssertion | undefined,
): Promise<Record<string, string> | undefined> {
  const token = await resolveProtectAssertion(assertion);
  return token ? { [PROTECT_ASSERTION_PARAM]: token } : undefined;
}
