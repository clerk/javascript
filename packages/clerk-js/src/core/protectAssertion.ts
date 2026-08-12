import { logger } from '@clerk/shared/logger';
import type { ProtectAssertion } from '@clerk/shared/types';

/** The request param carrying a Protect assertion; deliberately the same name as the cookie that can carry it. */
export const PROTECT_ASSERTION_PARAM = '__clerk_protect_assertion';

/**
 * Resolves the configured assertion for one request. Never rejects: a failing resolver or
 * invalid value yields `undefined`, because an assertion may influence a sign-in but must never prevent one.
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

  // `undefined` is the documented "no assertion right now", so it is not worth a warning.
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
 * The Protect params to merge into a sign-in or sign-up request body. Returns `undefined`
 * rather than `{}` so a request with no assertion is byte-for-byte what it was before.
 */
export async function protectAssertionParams(
  assertion: ProtectAssertion | undefined,
): Promise<Record<string, string> | undefined> {
  const token = await resolveProtectAssertion(assertion);
  return token ? { [PROTECT_ASSERTION_PARAM]: token } : undefined;
}
