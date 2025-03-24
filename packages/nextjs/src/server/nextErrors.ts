import type { JwtPayload } from '@clerk/types';

/**
 * Clerk's identifiers that are used alongside the ones from Next.js
 */
const CONTROL_FLOW_ERROR = {
  REDIRECT_TO_URL: 'CLERK_PROTECT_REDIRECT_TO_URL',
  REDIRECT_TO_SIGN_IN: 'CLERK_PROTECT_REDIRECT_TO_SIGN_IN',
};

/**
 * In-house implementation of `notFound()`
 * https://github.com/vercel/next.js/blob/canary/packages/next/src/client/components/not-found.ts
 */
const LEGACY_NOT_FOUND_ERROR_CODE = 'NEXT_NOT_FOUND';

type LegacyNotFoundError = Error & {
  digest: typeof LEGACY_NOT_FOUND_ERROR_CODE;
};

/**
 * Checks for the error thrown from `notFound()` for versions <= next@15.0.4
 */
function isLegacyNextjsNotFoundError(error: unknown): error is LegacyNotFoundError {
  if (typeof error !== 'object' || error === null || !('digest' in error)) {
    return false;
  }

  return error.digest === LEGACY_NOT_FOUND_ERROR_CODE;
}

const HTTPAccessErrorStatusCodes = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
};

const ALLOWED_CODES = new Set(Object.values(HTTPAccessErrorStatusCodes));

export const HTTP_ERROR_FALLBACK_ERROR_CODE = 'NEXT_HTTP_ERROR_FALLBACK';

export type HTTPAccessFallbackError = Error & {
  digest: `${typeof HTTP_ERROR_FALLBACK_ERROR_CODE};${string}`;
};

export function isHTTPAccessFallbackError(error: unknown): error is HTTPAccessFallbackError {
  if (typeof error !== 'object' || error === null || !('digest' in error) || typeof error.digest !== 'string') {
    return false;
  }
  const [prefix, httpStatus] = error.digest.split(';');

  return prefix === HTTP_ERROR_FALLBACK_ERROR_CODE && ALLOWED_CODES.has(Number(httpStatus));
}

export function whichHTTPAccessFallbackError(error: unknown): number | undefined {
  if (!isHTTPAccessFallbackError(error)) {
    return undefined;
  }

  const [, httpStatus] = error.digest.split(';');
  return Number(httpStatus);
}

function isNextjsNotFoundError(error: unknown): error is LegacyNotFoundError | HTTPAccessFallbackError {
  return (
    isLegacyNextjsNotFoundError(error) ||
    // Checks for the error thrown from `notFound()` for canary versions of next@15
    whichHTTPAccessFallbackError(error) === HTTPAccessErrorStatusCodes.NOT_FOUND
  );
}

/**
 * In-house implementation of `redirect()` extended with a `clerk_digest` property
 * https://github.com/vercel/next.js/blob/canary/packages/next/src/client/components/redirect.ts
 */

const REDIRECT_ERROR_CODE = 'NEXT_REDIRECT';

type RedirectError<T = unknown> = Error & {
  digest: `${typeof REDIRECT_ERROR_CODE};${'replace'};${string};${307};`;
  clerk_digest: typeof CONTROL_FLOW_ERROR.REDIRECT_TO_URL | typeof CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN;
} & T;

function nextjsRedirectError(
  url: string,
  extra: Record<string, unknown>,
  type: 'replace' = 'replace',
  statusCode: 307 = 307,
): never {
  const error = new Error(REDIRECT_ERROR_CODE) as RedirectError;
  error.digest = `${REDIRECT_ERROR_CODE};${type};${url};${statusCode};`;
  error.clerk_digest = CONTROL_FLOW_ERROR.REDIRECT_TO_URL;
  Object.assign(error, extra);
  throw error;
}

function redirectToSignInError(
  url: string,
  returnBackUrl?: string | URL | null,
  sessionStatus?: JwtPayload['sts'],
): never {
  nextjsRedirectError(url, {
    clerk_digest: CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN,
    returnBackUrl: returnBackUrl === null ? '' : returnBackUrl || url,
    sessionStatus,
  });
}

/**
 * Checks an error to determine if it's an error generated by the
 * `redirect(url)` helper.
 *
 * @param error the error that may reference a redirect error
 * @returns true if the error is a redirect error
 */
function isNextjsRedirectError(error: unknown): error is RedirectError<{ redirectUrl: string | URL }> {
  if (typeof error !== 'object' || error === null || !('digest' in error) || typeof error.digest !== 'string') {
    return false;
  }

  const digest = error.digest.split(';');
  const [errorCode, type] = digest;
  const destination = digest.slice(2, -2).join(';');
  const status = digest.at(-2);

  const statusCode = Number(status);

  return (
    errorCode === REDIRECT_ERROR_CODE &&
    (type === 'replace' || type === 'push') &&
    typeof destination === 'string' &&
    !isNaN(statusCode) &&
    statusCode === 307
  );
}

function isRedirectToSignInError(
  error: unknown,
): error is RedirectError<{ returnBackUrl: string | URL; sessionStatus?: JwtPayload['sts'] }> {
  if (isNextjsRedirectError(error) && 'clerk_digest' in error) {
    return error.clerk_digest === CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN;
  }

  return false;
}

export {
  isNextjsNotFoundError,
  isLegacyNextjsNotFoundError,
  redirectToSignInError,
  nextjsRedirectError,
  isNextjsRedirectError,
  isRedirectToSignInError,
};
