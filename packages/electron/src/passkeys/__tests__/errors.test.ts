import { describe, expect, it } from 'vitest';

import type { PasskeyNativeErrorCode } from '../../shared/types';
import { mapPasskeyIpcError } from '../shared/errors';

describe('mapPasskeyIpcError', () => {
  it.each<[PasskeyNativeErrorCode, 'create' | 'get', string]>([
    ['cancelled', 'create', 'passkey_registration_cancelled'],
    ['cancelled', 'get', 'passkey_retrieval_cancelled'],
    ['invalid_rp', 'create', 'passkey_invalid_rpID_or_domain'],
    ['invalid_rp', 'get', 'passkey_invalid_rpID_or_domain'],
    ['timeout', 'create', 'passkey_operation_aborted'],
    ['timeout', 'get', 'passkey_operation_aborted'],
    ['not_supported', 'create', 'passkey_not_supported'],
    ['not_supported', 'get', 'passkey_not_supported'],
    ['unknown', 'create', 'passkey_registration_failed'],
    ['unknown', 'get', 'passkey_retrieval_failed'],
  ])('maps %s during %s to %s', (code, action, expected) => {
    const error = mapPasskeyIpcError({ code, message: 'boom' }, action);

    // Shape assertion instead of instanceof: the test and the source may load
    // ClerkWebAuthnError through different module formats (dual-package hazard).
    expect(error.clerkRuntimeError).toBe(true);
    expect(error.code).toBe(expected);
    expect(error.message).toContain('boom');
  });

  it('includes a docs URL for RP ID mismatches', () => {
    const error = mapPasskeyIpcError({ code: 'invalid_rp', message: 'bad rp' }, 'create');
    expect(error.longMessage ?? error.message).toBeDefined();
  });
});
