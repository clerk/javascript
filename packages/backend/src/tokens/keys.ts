import { API_URL, API_VERSION, JWKS_CACHE_TTL_MS, MAX_CACHE_LAST_UPDATED_AT_SECONDS } from '../constants';
import {
  TokenVerificationError,
  TokenVerificationErrorAction,
  TokenVerificationErrorCode,
  TokenVerificationErrorReason,
} from '../errors';
// DO NOT CHANGE: Runtime needs to be imported as a default export so that we can stub its dependencies with Sinon.js
// For more information refer to https://sinonjs.org/how-to/stub-dependency/
import runtime from '../runtime';
import { joinPaths } from '../util/path';
import { getErrorObjectByCode } from '../util/request';
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

function setInCache(jwk: JsonWebKeyWithKid, jwksCacheTtlInMs: number) {
  cache[jwk.kid] = jwk;
  lastUpdatedAt = Date.now();

  if (jwksCacheTtlInMs >= 0) {
    setTimeout(() => {
      if (jwk) {
        delete cache[jwk.kid];
      } else {
        cache = {};
      }
    }, jwksCacheTtlInMs);
  }
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
 * @returns {JsonWebKey} key
 */
export function loadClerkJWKFromLocal(localKey?: string): JsonWebKey {
  if (!getFromCache(LocalJwkKid)) {
    if (!localKey) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.SetClerkJWTKey,
        message: 'Missing local JWK.',
        reason: TokenVerificationErrorReason.LocalJWKMissing,
      });
    }

    const modulus = localKey
      .replace(/(\r\n|\n|\r)/gm, '')
      .replace(PEM_HEADER, '')
      .replace(PEM_TRAILER, '')
      .replace(RSA_PREFIX, '')
      .replace(RSA_SUFFIX, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // JWK https://datatracker.ietf.org/doc/html/rfc7517
    setInCache(
      {
        kid: 'local',
        kty: 'RSA',
        alg: 'RS256',
        n: modulus,
        e: 'AQAB',
      },
      -1, // local key never expires in cache
    );
  }

  return getFromCache(LocalJwkKid);
}

export type LoadClerkJWKFromRemoteOptions = {
  kid: string;
  jwksCacheTtlInMs?: number;
  skipJwksCache?: boolean;
  secretKey?: string;
  apiUrl?: string;
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
 * @param {number} options.jwksCacheTtlInMs - The TTL of the jwks cache (defaults to 1 hour)
 * @returns {JsonWebKey} key
 */
export async function loadClerkJWKFromRemote({
  secretKey,
  apiUrl = API_URL,
  apiVersion = API_VERSION,
  kid,
  jwksCacheTtlInMs = JWKS_CACHE_TTL_MS,
  skipJwksCache,
}: LoadClerkJWKFromRemoteOptions): Promise<JsonWebKey> {
  const needsFetch = !getFromCache(kid) || cacheHasExpired();
  if (skipJwksCache || needsFetch) {
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

    keys.forEach(key => setInCache(key, jwksCacheTtlInMs));
  }

  const jwk = getFromCache(kid);

  if (!jwk) {
    const cacheValues = getCacheValues();
    const jwkKeys = cacheValues.map(jwk => jwk.kid).sort().join(', ');

    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.ContactSupport,
      message: `Unable to find a signing key in JWKS that matches the kid='${kid}' of the provided session token. Please make sure that the __session cookie or the HTTP authorization header contain a Clerk-generated session JWT.${
        jwkKeys ? ` The following kid are available: ${jwkKeys}` : ''
      }`,
      reason: TokenVerificationErrorReason.RemoteJWKMissing,
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
      'Content-Type': 'application/json',
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
  return Date.now() - lastUpdatedAt >= MAX_CACHE_LAST_UPDATED_AT_SECONDS * 1000;
}
