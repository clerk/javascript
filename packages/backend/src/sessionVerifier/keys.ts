import fetch from '../runtime/fetch';
import { callWithRetry } from '../util/callWithRetry';

export type LoadKeyOptions = {
  localKey?: string;
  issuer?: string;
  kid?: string;
  jwksTTL?: number;
};

/**
 *
 * Loads the JWT verification key.
 *
 * The key resolution algorithm is the following:
 *
 * 1. The algorithm looks for a local environment key (PEM format) and returns it in JsonWebKey format.
 * 2. If no local key is available, if fetches the public JWKS key for the specified issuer.
 * 3. When JWKS are retrieved, it looks for the id of the key that signed the current JWT and returns it in JsonWebKey format.
 *
 * @param {Object} options
 * @param {string} options.issuer - The issuer origin of the JWT
 * @param {string} options.kid - The id of the key that the JWT was signed with
 * @param {number} options.jwksTTL - The TTL of the jwks cache (defaults to 1 hour)
 * @returns {JsonWebKey} key
 */
export function loadKey({
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  localKey = process.env.CLERK_JWT_KEY,
  issuer,
  kid,
  jwksTTL,
}: LoadKeyOptions): Promise<JsonWebKey> {
  if (localKey) {
    return Promise.resolve(loadClerkJWKFromLocal(localKey));
  }
  return loadClerkJWKFromAPI({ issuer, kid, jwksTTL });
}

let cachedLocalKey: JsonWebKey;

/**
 *
 * Loads a local PEM key usually from process.env and transform it to JsonWebKey format.
 * The result is also cached on the module level to avoid unnecessary computations in subsequent invocations.
 *
 * @param {string} key
 * @returns {JsonWebKey} key
 */
function loadClerkJWKFromLocal(localKey: string | undefined | null): JsonWebKey {
  if (!cachedLocalKey) {
    if (!localKey) {
      // TODO: Throw a SessionVerifierError
      throw new Error('Missing local key');
    }

    // Notice:
    // Currently Next.js in development mode cannot parse PEM key format, but it can parse JWKs.
    // This is a simple way to convert our PEM keys to JWKs until the bug is resolved.
    const RSA_PREFIX = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA';
    const RSA_SUFFIX = 'IDAQAB';

    // JWK https://datatracker.ietf.org/doc/html/rfc7517
    cachedLocalKey = {
      kty: 'RSA',
      n: localKey
        .slice(RSA_PREFIX.length, RSA_SUFFIX.length * -1)
        .replace(/\+/g, '-')
        .replace(/\//g, '_'),
      e: 'AQAB',
    };
  }

  return cachedLocalKey;
}

type JsonWebKeyWithKid = JsonWebKey & { kid: string };

let cachedJWKS: JsonWebKeyWithKid[] = [];
let clearJWKSTimeoutId: ReturnType<typeof setTimeout> | null = null;

/**
 *
 * Schedules a timer to clear the cached JWKS value.
 *
 * @param ttl
 * @returns
 */
function scheduleCachedJWKSClearance(
  ttl = 1000 * 60 * 60, // 1 hour
): void {
  if (clearJWKSTimeoutId) {
    clearTimeout(clearJWKSTimeoutId);
  }

  clearJWKSTimeoutId = setTimeout(() => (cachedJWKS = []), ttl);

  return;
}

/**
 *
 * Loads a key from JWKS retrieved from the well-known API endpoint of the issuer.
 * The result is also cached on the module level to avoid network requests in subsequent invocations.
 * The cache lasts 1 hour by default.
 *
 * @param {Object} options
 * @param {string} options.issuer - The issuer origin of the JWT
 * @param {string} options.kid - The id of the key that the JWT was signed with
 * @param {number} options.jwksTTL - The TTL of the jwks cache (defaults to 1 hour)
 * @returns {JsonWebKey} key
 */
async function loadClerkJWKFromAPI({
  issuer,
  kid,
  jwksTTL = 1000 * 60 * 60, // 1 hour,
}: Omit<LoadKeyOptions, 'localKey'>): Promise<JsonWebKey> {
  if (!issuer) {
    // TODO: Throw a SessionVerifierError
    throw new Error('Missing issuer option');
  }

  async function fetchJWKS() {
    const url = new URL(issuer!);

    if (!url.pathname.endsWith('/')) {
      url.pathname += '/';
    }
    url.pathname += '.well-known/jwks.json';

    const response = await fetch(url);

    if (!response.ok) {
      // TODO: Throw a SessionVerifierError
      throw new Error(`Error loading Clerk JWKS from ${url.href}: ${response.status}-${response.statusText}`);
    }

    return response.json();
  }

  if (!cachedJWKS) {
    const { keys }: { keys: JsonWebKeyWithKid[] } = await callWithRetry(fetchJWKS);

    if (!keys || !keys.length) {
      // TODO: Throw a SessionVerifierError
      throw new Error('The JWKS endpoint did not contain any signing keys');
    }

    cachedJWKS = keys;
    scheduleCachedJWKSClearance(jwksTTL);
  }

  const key = cachedJWKS.find(k => !!k.kid && k.kid === kid);

  if (!key) {
    // TODO: Throw a SessionVerifierError
    throw new Error(`Unable to find a signing key that matches '${kid}'`);
  }

  return key;
}
