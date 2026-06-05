/**
 * Resolution of per-instance Clerk credentials for integration tests, including the
 * staging-mode swap. This lives in its own module, free of import-time side effects, so
 * the staging-fallback invariant can be unit-tested without constructing every env in
 * `envs.ts` (which requires a full production key map at module load).
 */

export const STAGING_API_URL = 'https://api.clerkstage.dev';
export const STAGING_KEY_PREFIX = 'clerkstage-';

/**
 * Placeholder credentials applied to an env that has no staging mirror while running in
 * staging mode (`E2E_STAGING=1`). They are intentionally invalid so a staging run can
 * never authenticate against the *production* instance: any path that bypasses the
 * `isStagingReady` graceful-skip (e.g. a test that builds its own app via `app.withEnv`)
 * fails fast against a non-existent instance instead of silently driving production.
 */
export const STAGING_UNAVAILABLE_PK = 'pk_test_staging-key-unavailable';
export const STAGING_UNAVAILABLE_SK = 'sk_test_staging-key-unavailable';

export interface InstanceCredentials {
  pk: string;
  sk: string;
}

export interface ResolvedInstanceConfig {
  pk: string;
  sk: string;
  /** Staging API URL to set on the env, or undefined to leave it as-is. */
  apiUrl?: string;
  /** Whether to clear an inherited CLERK_API_URL (the staging-unavailable case). */
  clearApiUrl: boolean;
}

/**
 * Decide which credentials and API URL an instance env should use:
 * - non-staging: the production keys for this instance.
 * - staging mode with a `clerkstage-<keyName>` key: the staging keys + staging API URL.
 * - staging mode without a staging key: placeholder keys and a cleared API URL, so the
 *   env is not staging-ready and never carries production credentials.
 */
export function resolveInstanceConfig(
  keyName: string,
  keys: Map<string, InstanceCredentials>,
  isStaging: boolean,
): ResolvedInstanceConfig {
  if (!isStaging) {
    const prod = keys.get(keyName);
    if (!prod) {
      throw new Error(`Missing instance keys for "${keyName}". Is your env or .keys.json file populated?`);
    }
    return { pk: prod.pk, sk: prod.sk, clearApiUrl: false };
  }

  const stagingKeys = keys.get(STAGING_KEY_PREFIX + keyName);
  if (stagingKeys) {
    return { pk: stagingKeys.pk, sk: stagingKeys.sk, apiUrl: STAGING_API_URL, clearApiUrl: false };
  }

  return { pk: STAGING_UNAVAILABLE_PK, sk: STAGING_UNAVAILABLE_SK, clearApiUrl: true };
}
