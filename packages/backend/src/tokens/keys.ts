import fetch from '../runtime/fetch';
import { callWithRetry } from '../util/callWithRetry';
import { joinPaths } from '../util/path';

type JsonWebKeyWithKid = JsonWebKey & { kid: string };

type JsonWebKeyCache = Record<string, JsonWebKeyWithKid>;

let cache: JsonWebKeyCache = {};

function getFromCache(kid: string) {
  return cache[kid];
}

function setInCache(
  jwk: JsonWebKeyWithKid,
  jwksTtlInMs: number = 1000 * 60 * 60, // 1 hour
) {
  cache[jwk.kid] = jwk;

  if (jwksTtlInMs >= 0) {
    setTimeout(() => {
      if (jwk) {
        delete cache[jwk.kid];
      } else {
        cache = {};
      }
    }, jwksTtlInMs);
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
      throw new Error('Missing local JWK');
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

export type LoadClerkJWKFromRemoteOptions = { kid: string; jwksTtlInMs?: number } & (
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
 * @param {number} options.jwksTtlInMs - The TTL of the jwks cache (defaults to 1 hour)
 * @returns {JsonWebKey} key
 */
export async function loadClerkJWKFromRemote({
  apiKey,
  apiUrl,
  issuer,
  kid,
  jwksTtlInMs = 1000 * 60 * 60, // 1 hour,
}: LoadClerkJWKFromRemoteOptions): Promise<JsonWebKey> {
  if (!getFromCache(kid)) {
    let fetcher;

    if (apiUrl && apiKey) {
      fetcher = () => fetchJWKSFromBAPI(apiUrl, apiKey);
    } else if (issuer) {
      fetcher = () => fetchJWKSFromFAPI(issuer);
    } else {
      throw new Error('Failed to load JWKS from Clerk Backend or Frontend API');
    }

    const { keys }: { keys: JsonWebKeyWithKid[] } = await callWithRetry(fetcher);

    if (!keys || !keys.length) {
      throw new Error('The JWKS endpoint did not contain any signing keys');
    }

    keys.forEach(key => setInCache(key, jwksTtlInMs));
  }

  const jwk = getFromCache(kid);

  if (!jwk) {
    throw new Error(`Unable to find a signing key that matches kid='${kid}'`);
  }

  return jwk;
}

async function fetchJWKSFromFAPI(issuer: string) {
  const url = new URL(issuer);
  url.pathname = joinPaths(url.pathname, '.well-known/jwks.json');

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error loading Clerk JWKS from ${url.href} with code=${response.status}`);
  }

  return response.json();
}

async function fetchJWKSFromBAPI(apiUrl: string, apiKey: string) {
  const url = new URL(apiUrl);
  url.pathname = joinPaths(url.pathname, 'v1/jwks');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error loading Clerk JWKS from ${url.href} with code=${response.status}`);
  }

  return response.json();
}
