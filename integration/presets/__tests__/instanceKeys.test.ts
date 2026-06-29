import { describe, expect, it } from 'vitest';

import {
  resolveInstanceConfig,
  STAGING_API_URL,
  STAGING_UNAVAILABLE_PK,
  STAGING_UNAVAILABLE_SK,
} from '../instanceKeys';

const PROD = { pk: 'pk_live_prod', sk: 'sk_live_prod' };
const STAGING = { pk: 'pk_test_staging', sk: 'sk_test_staging' };

function makeKeys(entries: Record<string, { pk: string; sk: string }>) {
  return new Map(Object.entries(entries));
}

describe('resolveInstanceConfig', () => {
  it('uses production keys in non-staging mode and does not touch the API URL', () => {
    const keys = makeKeys({ 'with-email-codes': PROD });
    const cfg = resolveInstanceConfig('with-email-codes', keys, false);
    expect(cfg).toEqual({ pk: PROD.pk, sk: PROD.sk, clearApiUrl: false });
  });

  it('swaps to staging keys and sets the staging API URL when a staging key exists', () => {
    const keys = makeKeys({ 'with-email-codes': PROD, 'clerkstage-with-email-codes': STAGING });
    const cfg = resolveInstanceConfig('with-email-codes', keys, true);
    expect(cfg).toEqual({ pk: STAGING.pk, sk: STAGING.sk, apiUrl: STAGING_API_URL, clearApiUrl: false });
  });

  it('NEVER returns production keys in staging mode when the staging key is missing', () => {
    const keys = makeKeys({ 'with-no-staging-mirror': PROD });
    const cfg = resolveInstanceConfig('with-no-staging-mirror', keys, true);

    // The core safety invariant: a staging run must not carry production credentials.
    expect(cfg.pk).not.toBe(PROD.pk);
    expect(cfg.sk).not.toBe(PROD.sk);
    expect(cfg.pk).toBe(STAGING_UNAVAILABLE_PK);
    expect(cfg.sk).toBe(STAGING_UNAVAILABLE_SK);
    // And it must be marked not-staging-ready by clearing any inherited API URL.
    expect(cfg.clearApiUrl).toBe(true);
    expect(cfg.apiUrl).toBeUndefined();
  });

  it('placeholder keys are not real Clerk keys (cannot authenticate anywhere real)', () => {
    expect(STAGING_UNAVAILABLE_PK).toContain('staging-key-unavailable');
    expect(STAGING_UNAVAILABLE_SK).toContain('staging-key-unavailable');
  });
});
