import {
  API_URL,
  API_VERSION,
  MAX_CACHE_LAST_UPDATED_AT_SECONDS,
  SUPPORTED_BAPI_VERSION,
  USER_AGENT,
} from '../constants';
import {
  TokenVerificationError,
  TokenVerificationErrorAction,
  TokenVerificationErrorCode,
  TokenVerificationErrorReason,
} from '../errors';
import { runtime } from '../runtime';
import { joinPaths } from '../util/path';
import { callWithRetry } from '../util/shared';

type JsonWebKeyWithKid = JsonWebKey & { kid: string };

type JsonWebKeyCache = Record<string, JsonWebKeyWithKid>;

let cache: JsonWebKeyCache = {};
let lastUpdatedAt = 0;

function getFromCache(kid: string) {
  return cache[kid];
}

function getCacheValues() {
  return Object.values(cache);
}

function setInCache(jwk: JsonWebKeyWithKid, shouldExpire = true) {
  cache[jwk.kid] = jwk;
  lastUpdatedAt = shouldExpire ? Date.now() : -1;
}

const LocalJwkKid = 'local';
const PEM_HEADER = '-----BEGIN PUBLIC KEY-----';
const PEM_TRAILER = '-----END PUBLIC KEY-----';
const RSA_PREFIX = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA';
const RSA_SUFFIX = 'IDAQAB';

/**
 *
 * Loads a local PEM key usually from process.env and transform it to JsonWebKey format.
 * The result is also cached on the module level to avoid unnecessary computations in subsequent invocations.
 *
 * @param {string} localKey
 * @param {string} kid
 * @returns {JsonWebKey} key
 */
export function loadClerkJWKFromLocal(localKey?: string, kid = LocalJwkKid): JsonWebKey {
  if (!getFromCache(kid)) {
    if (!localKey) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.SetClerkJWTKey,
        message: 'Missing local JWK.',
        reason: TokenVerificationErrorReason.LocalJWKMissing,
      });
    }

    const modulus = localKey
      .replace(/\r\n|\n|\r/g, '')
      .replace(PEM_HEADER, '')
      .replace(PEM_TRAILER, '')
      .replace(RSA_PREFIX, '')
      .replace(RSA_SUFFIX, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // JWK https://datatracker.ietf.org/doc/html/rfc7517
    setInCache(
      {
        kid,
        kty: 'RSA',
        alg: 'RS256',
        n: modulus,
        e: 'AQAB',
      },
      false, // local key never expires in cache
    );
  }

  return getFromCache(kid);
}

export type LoadClerkJWKFromRemoteOptions = {
  /**
   * @internal
   */
  kid: string;
  /**
   * @deprecated This cache TTL is deprecated and will be removed in the next major version. Specifying a cache TTL is now a no-op.
   */
  jwksCacheTtlInMs?: number;
  /**
   * A flag to skip ignore cache and always fetch JWKS before each jwt verification.
   */
  skipJwksCache?: boolean;
  /**
   * The Clerk Secret Key from the [**API keys**](https://dashboard.clerk.com/last-active?path=api-keys) page in the Clerk Dashboard.
   */
  secretKey?: string;
  /**
   * The [Clerk Backend API](https://clerk.com/docs/reference/backend-api) endpoint. Defaults to `'https://api.clerk.com'`.
   */
  apiUrl?: string;
  /**
   * The version passed to the Clerk API. Defaults to `'v1'`.
   */
  apiVersion?: string;
};

/**
 *
 * Loads a key from JWKS retrieved from the well-known Frontend API endpoint of the issuer.
 * The result is also cached on the module level to avoid network requests in subsequent invocations.
 * The cache lasts 1 hour by default.
 *
 * @param {Object} options
 * @param {string} options.kid - The id of the key that the JWT was signed with
 * @param {string} options.alg - The algorithm of the JWT
 * @returns {JsonWebKey} key
 */
export async function loadClerkJWKFromRemote({
  secretKey,
  apiUrl = API_URL,
  apiVersion = API_VERSION,
  kid,
  skipJwksCache,
}: LoadClerkJWKFromRemoteOptions): Promise<JsonWebKey> {
  if (skipJwksCache || cacheHasExpired() || !getFromCache(kid)) {
    if (!secretKey) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: 'Failed to load JWKS from Clerk Backend or Frontend API.',
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
      });
    }
    const fetcher = () => fetchJWKSFromBAPI(apiUrl, secretKey, apiVersion);
    const { keys } = await callWithRetry<{ keys: JsonWebKeyWithKid[] }>(fetcher);

    if (!keys || !keys.length) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: 'The JWKS endpoint did not contain any signing keys. Contact support@clerk.com.',
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
      });
    }

    keys.forEach(key => setInCache(key));
  }

  const jwk = getFromCache(kid);

  if (!jwk) {
    const cacheValues = getCacheValues();
    const jwkKeys = cacheValues
      .map(jwk => jwk.kid)
      .sort()
      .join(', ');

    throw new TokenVerificationError({
      action: `Go to your Dashboard and validate your secret and public keys are correct. ${TokenVerificationErrorAction.ContactSupport} if the issue persists.`,
      message: `Unable to find a signing key in JWKS that matches the kid='${kid}' of the provided session token. Please make sure that the __session cookie or the HTTP authorization header contain a Clerk-generated session JWT. The following kid is available: ${jwkKeys}`,
      reason: TokenVerificationErrorReason.JWKKidMismatch,
    });
  }

  return jwk;
}

async function fetchJWKSFromBAPI(apiUrl: string, key: string, apiVersion: string) {
  if (!key) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkSecretKey,
      message:
        'Missing Clerk Secret Key or API Key. Go to https://dashboard.clerk.com and get your key for your instance.',
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
    });
  }

  const url = new URL(apiUrl);
  url.pathname = joinPaths(url.pathname, apiVersion, '/jwks');

  const response = await runtime.fetch(url.href, {
    headers: {
      Authorization: `Bearer ${key}`,
      'Clerk-API-Version': SUPPORTED_BAPI_VERSION,
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    const json = await response.json();
    const invalidSecretKeyError = getErrorObjectByCode(json?.errors, TokenVerificationErrorCode.InvalidSecretKey);

    if (invalidSecretKeyError) {
      const reason = TokenVerificationErrorReason.InvalidSecretKey;

      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: invalidSecretKeyError.message,
        reason,
      });
    }

    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.ContactSupport,
      message: `Error loading Clerk JWKS from ${url.href} with code=${response.status}`,
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
    });
  }

  return response.json();
}

function cacheHasExpired() {
  // If lastUpdatedAt is -1, it means that we're using a local JWKS and it never expires
  if (lastUpdatedAt === -1) {
    return false;
  }

  // If the cache has expired, clear the value so we don't attempt to make decisions based on stale data
  const isExpired = Date.now() - lastUpdatedAt >= MAX_CACHE_LAST_UPDATED_AT_SECONDS * 1000;

  if (isExpired) {
    cache = {};
  }

  return isExpired;
}

type ErrorFields = {
  message: string;
  long_message: string;
  code: string;
};

const getErrorObjectByCode = (errors: ErrorFields[], code: string) => {
  if (!errors) {
    return null;
  }

  return errors.find((err: ErrorFields) => err.code === code);
};
