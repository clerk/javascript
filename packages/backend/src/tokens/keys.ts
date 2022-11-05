import runtime from '../runtime';
import { callWithRetry } from '../util/callWithRetry';
import { joinPaths } from '../util/path';
import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from './errors';

type JsonWebKeyWithKid = JsonWebKey & { kid: string };

type JsonWebKeyCache = Record<string, JsonWebKeyWithKid>;

let cache: JsonWebKeyCache = {};

function getFromCache(kid: string) {
  return cache[kid];
}

function setInCache(
  jwk: JsonWebKeyWithKid,
  jwksCacheTtlInMs: number = 1000 * 60 * 60, // 1 hour
) {
  cache[jwk.kid] = jwk;

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

/**
 *
 * Loads a local PEM key usually from process.env and transform it to JsonWebKey format.
 * The result is also cached on the module level to avoid unnecessary computations in subsequent invocations.
 *
 * @param {string} key
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

    // Notice:
    // Currently Next.js in development mode cannot parse PEM key format, but it can parse JWKs.
    // This is a simple way to convert our PEM keys to JWKs until the bug is resolved.
    const RSA_PREFIX = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA';
    const RSA_SUFFIX = 'IDAQAB';

    // JWK https://datatracker.ietf.org/doc/html/rfc7517
    setInCache(
      {
        kid: 'local',
        kty: 'RSA',
        n: localKey
          .slice(RSA_PREFIX.length, RSA_SUFFIX.length * -1)
          .replace(/\+/g, '-')
          .replace(/\//g, '_'),
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
} & (
  | {
      apiKey: string;
      apiUrl: string;
      issuer?: never;
    }
  | {
      apiKey?: never;
      apiUrl?: never;
      issuer: string;
    }
);

/**
 *
 * Loads a key from JWKS retrieved from the well-known Frontend API endpoint of the issuer.
 * The result is also cached on the module level to avoid network requests in subsequent invocations.
 * The cache lasts 1 hour by default.
 *
 * @param {Object} options
 * @param {string} options.issuer - The issuer origin of the JWT
 * @param {string} options.kid - The id of the key that the JWT was signed with
 * @param {string} options.alg - The algorithm of the JWT
 * @param {number} options.jwksCacheTtlInMs - The TTL of the jwks cache (defaults to 1 hour)
 * @returns {JsonWebKey} key
 */
export async function loadClerkJWKFromRemote({
  apiKey,
  apiUrl,
  issuer,
  kid,
  jwksCacheTtlInMs = 1000 * 60 * 60, // 1 hour,
  skipJwksCache,
}: LoadClerkJWKFromRemoteOptions): Promise<JsonWebKey> {
  if (skipJwksCache || !getFromCache(kid)) {
    let fetcher;

    if (apiUrl && apiKey) {
      fetcher = () => fetchJWKSFromBAPI(apiUrl, apiKey);
    } else if (issuer) {
      fetcher = () => fetchJWKSFromFAPI(issuer);
    } else {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: 'Failed to load JWKS from Clerk Backend or Frontend API.',
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
      });
    }

    const { keys }: { keys: JsonWebKeyWithKid[] } = await callWithRetry(fetcher);

    if (!keys || !keys.length) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: 'The JWKS endpoint did not contain any signing keys. Contact support@clerk.dev.',
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
      });
    }

    keys.forEach(key => setInCache(key, jwksCacheTtlInMs));
  }

  const jwk = getFromCache(kid);

  if (!jwk) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.ContactSupport,
      message: `Unable to find a signing key in JWKS that matches kid='${kid}'.`,
      reason: TokenVerificationErrorReason.RemoteJWKMissing,
    });
  }

  return jwk;
}

async function fetchJWKSFromFAPI(issuer: string) {
  const url = new URL(issuer);
  url.pathname = joinPaths(url.pathname, '.well-known/jwks.json');

  const response = await runtime.fetch(url);

  if (!response.ok) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.ContactSupport,
      message: `Error loading Clerk JWKS from ${url.href} with code=${response.status}`,
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
    });
  }

  return response.json();
}

async function fetchJWKSFromBAPI(apiUrl: string, apiKey: string) {
  const url = new URL(apiUrl);
  url.pathname = joinPaths(url.pathname, 'v1/jwks');

  const response = await runtime.fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.ContactSupport,
      message: `Error loading Clerk JWKS from ${url.href} with code=${response.status}`,
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
    });
  }

  return response.json();
}
