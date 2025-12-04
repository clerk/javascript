import type { AuthObject } from '@clerk/backend';
import type { AuthenticateRequestOptions, ClerkRequest, RequestState } from '@clerk/backend/internal';
import { constants } from '@clerk/backend/internal';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps } from '@clerk/shared/proxy';
import { handleValueOrFn, isProductionEnvironment } from '@clerk/shared/utils';
import { NextResponse } from 'next/server';

import { constants as nextConstants } from '../constants';
import { canUseKeyless } from '../utils/feature-flags';
import { AES, HmacSHA1, Utf8 } from '../vendor/crypto-es';
import { DOMAIN, ENCRYPTION_KEY, IS_SATELLITE, PROXY_URL, SECRET_KEY, SIGN_IN_URL } from './constants';
import {
  authSignatureInvalid,
  encryptionKeyInvalid,
  encryptionKeyInvalidDev,
  encryptionKeyMissing,
  missingDomainAndProxy,
  missingSignInUrlInDev,
} from './errors';
import { errorThrower } from './errorThrower';
import { detectClerkMiddleware } from './headers-utils';
import type { RequestLike } from './types';

const OVERRIDE_HEADERS = 'x-middleware-override-headers';
const MIDDLEWARE_HEADER_PREFIX = 'x-middleware-request' as string;

export const setRequestHeadersOnNextResponse = (
  res: NextResponse | Response,
  req: Request,
  newHeaders: Record<string, string>,
) => {
  if (!res.headers.get(OVERRIDE_HEADERS)) {
    // Emulate a user setting overrides by explicitly adding the required nextjs headers
    // https://github.com/vercel/next.js/pull/41380
    // @ts-expect-error -- property keys does not exist on type Headers
    res.headers.set(OVERRIDE_HEADERS, [...req.headers.keys()]);
    req.headers.forEach((val, key) => {
      res.headers.set(`${MIDDLEWARE_HEADER_PREFIX}-${key}`, val);
    });
  }

  // Now that we have normalised res to include overrides, just append the new header
  Object.entries(newHeaders).forEach(([key, val]) => {
    res.headers.set(OVERRIDE_HEADERS, `${res.headers.get(OVERRIDE_HEADERS)},${key}`);
    res.headers.set(`${MIDDLEWARE_HEADER_PREFIX}-${key}`, val);
  });
};

// Auth result will be set as both a query param & header when applicable
export function decorateRequest(
  req: ClerkRequest,
  res: Response,
  requestState: RequestState,
  requestData: AuthenticateRequestOptions,
  keylessMode: Pick<AuthenticateRequestOptions, 'publishableKey' | 'secretKey'>,
  machineAuthObject: AuthObject | null,
): Response {
  const { reason, message, status, token } = requestState;
  // pass-through case, convert to next()
  if (!res) {
    res = NextResponse.next();
  }

  // redirect() case, return early
  if (res.headers.get(nextConstants.Headers.NextRedirect)) {
    return res;
  }

  let rewriteURL;

  // next() case, convert to a rewrite
  if (res.headers.get(nextConstants.Headers.NextResume) === '1') {
    res.headers.delete(nextConstants.Headers.NextResume);
    rewriteURL = new URL(req.url);
  }

  // rewrite() case, set auth result only if origin remains the same
  const rewriteURLHeader = res.headers.get(nextConstants.Headers.NextRewrite);

  if (rewriteURLHeader) {
    const reqURL = new URL(req.url);
    rewriteURL = new URL(rewriteURLHeader);

    // if the origin has changed, return early
    if (rewriteURL.origin !== reqURL.origin) {
      return res;
    }
  }

  if (rewriteURL) {
    const clerkRequestData = encryptClerkRequestData(requestData, keylessMode, machineAuthObject);

    setRequestHeadersOnNextResponse(res, req, {
      [constants.Headers.AuthStatus]: status,
      [constants.Headers.AuthToken]: token || '',
      [constants.Headers.AuthSignature]: token
        ? createTokenSignature(token, requestData?.secretKey || SECRET_KEY || keylessMode.secretKey || '')
        : '',
      [constants.Headers.AuthMessage]: message || '',
      [constants.Headers.AuthReason]: reason || '',
      [constants.Headers.ClerkUrl]: req.clerkUrl.toString(),
      ...(clerkRequestData ? { [constants.Headers.ClerkRequestData]: clerkRequestData } : {}),
    });
    res.headers.set(nextConstants.Headers.NextRewrite, rewriteURL.href);
  }

  return res;
}

export const handleMultiDomainAndProxy = (clerkRequest: ClerkRequest, opts: AuthenticateRequestOptions) => {
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(opts?.proxyUrl, clerkRequest.clerkUrl, PROXY_URL);

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && !isHttpOrHttps(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, clerkRequest.clerkUrl).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  const isSatellite = handleValueOrFn(opts.isSatellite, new URL(clerkRequest.url), IS_SATELLITE);
  const domain = handleValueOrFn(opts.domain, new URL(clerkRequest.url), DOMAIN);
  const signInUrl = opts?.signInUrl || SIGN_IN_URL;

  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(missingDomainAndProxy);
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(opts.secretKey || SECRET_KEY)) {
    throw new Error(missingSignInUrlInDev);
  }

  return {
    proxyUrl,
    isSatellite,
    domain,
    signInUrl,
  };
};

export const redirectAdapter = (url: string | URL) => {
  return NextResponse.redirect(url, { headers: { [constants.Headers.ClerkRedirectTo]: 'true' } });
};

export function assertAuthStatus(req: RequestLike, error: string) {
  if (!detectClerkMiddleware(req)) {
    throw new Error(error);
  }
}

export function assertKey(key: string | undefined, onError: () => never): string {
  if (!key) {
    onError();
  }

  return key;
}

/**
 * Compute a cryptographic signature from a session token and provided secret key. Used to validate that the token has not been modified when transferring between middleware and the Next.js origin.
 */
function createTokenSignature(token: string, key: string): string {
  return HmacSHA1(token, key).toString();
}

/**
 * Assert that the provided token generates a matching signature.
 */
export function assertTokenSignature(token: string, key: string, signature?: string | null) {
  if (!signature) {
    throw new Error(authSignatureInvalid);
  }

  const expectedSignature = createTokenSignature(token, key);
  if (expectedSignature !== signature) {
    throw new Error(authSignatureInvalid);
  }
}

const KEYLESS_ENCRYPTION_KEY = 'clerk_keyless_dummy_key';

/**
 * Encrypt request data propagated between server requests.
 * @internal
 **/
export function encryptClerkRequestData(
  requestData: Partial<AuthenticateRequestOptions>,
  keylessModeKeys: Pick<AuthenticateRequestOptions, 'publishableKey' | 'secretKey'>,
  machineAuthObject: AuthObject | null,
) {
  const isEmpty = (obj: Record<string, any> | undefined) => {
    if (!obj) {
      return true;
    }
    return !Object.values(obj).some(v => v !== undefined);
  };

  if (isEmpty(requestData) && isEmpty(keylessModeKeys) && !machineAuthObject) {
    return;
  }

  if (requestData.secretKey && !ENCRYPTION_KEY) {
    throw new Error(encryptionKeyMissing);
  }

  const maybeKeylessEncryptionKey = isProductionEnvironment()
    ? ENCRYPTION_KEY || assertKey(SECRET_KEY, () => errorThrower.throwMissingSecretKeyError())
    : ENCRYPTION_KEY || SECRET_KEY || KEYLESS_ENCRYPTION_KEY;

  return AES.encrypt(
    JSON.stringify({ ...keylessModeKeys, ...requestData, machineAuthObject: machineAuthObject ?? undefined }),
    maybeKeylessEncryptionKey,
  ).toString();
}

/**
 * Decrypt request data propagated between server requests.
 * @internal
 */
export function decryptClerkRequestData(
  encryptedRequestData?: string | undefined | null,
): Partial<AuthenticateRequestOptions> & { machineAuthObject?: AuthObject } {
  if (!encryptedRequestData) {
    return {};
  }

  const maybeKeylessEncryptionKey = isProductionEnvironment()
    ? ENCRYPTION_KEY || SECRET_KEY
    : ENCRYPTION_KEY || SECRET_KEY || KEYLESS_ENCRYPTION_KEY;

  try {
    return decryptData(encryptedRequestData, maybeKeylessEncryptionKey);
  } catch {
    /**
     * There is a great chance when running in Keyless mode that the above fails,
     * because the keys hot-swapped and the Next.js dev server has not yet fully rebuilt middleware and routes.
     *
     * Attempt one more time with the default dummy value.
     */
    if (canUseKeyless) {
      try {
        return decryptData(encryptedRequestData, KEYLESS_ENCRYPTION_KEY);
      } catch {
        throwInvalidEncryptionKey();
      }
    }
    throwInvalidEncryptionKey();
  }
}

function throwInvalidEncryptionKey(): never {
  if (isProductionEnvironment()) {
    throw new Error(encryptionKeyInvalid);
  }
  throw new Error(encryptionKeyInvalidDev);
}

function decryptData(data: string, key: string) {
  const decryptedBytes = AES.decrypt(data, key);
  const encoded = decryptedBytes.toString(Utf8);
  return JSON.parse(encoded);
}
