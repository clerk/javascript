import { describe, expect, it } from 'vitest';

import { Passkey } from '../Passkey';

describe('Passkey', () => {
  it('has the same initial properties', () => {
    const passkey = new Passkey({
      object: 'passkey',
      id: 'passkey_123',
      name: 'My Device',
      credential_id: 'credential_abc123',
      verification: {
        object: 'verification',
        id: 'verification_123',
        status: 'verified',
        strategy: 'passkey',
        attempts: 1,
        expire_at: 1735689700000,
        verified_at_client: null,
        error: null,
      },
      last_used_at: 1735689600000,
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    expect(passkey).toMatchObject({
      id: 'passkey_123',
      name: 'My Device',
      credentialId: 'credential_abc123',
      verification: expect.any(Object),
      lastUsedAt: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

describe('Passkey Snapshots', () => {
  it('should match snapshot for passkey structure', () => {
    const passkey = new Passkey({
      object: 'passkey',
      id: 'passkey_123',
      name: 'MacBook Pro Touch ID',
      credential_id: 'cred_abcd1234efgh5678',
      verification: {
        object: 'verification',
        id: 'verification_123',
        status: 'verified',
        strategy: 'passkey',
        attempts: 1,
        expire_at: 1735689700000,
        verified_at_client: null,
        error: null,
      },
      last_used_at: 1735689600000,
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    const snapshot = {
      id: passkey.id,
      name: passkey.name,
      credentialId: passkey.credentialId,
      verification: {
        id: passkey.verification?.id,
        status: passkey.verification?.status,
        strategy: passkey.verification?.strategy,
      },
      lastUsedAt: passkey.lastUsedAt?.getTime(),
      createdAt: passkey.createdAt?.getTime(),
      updatedAt: passkey.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    const passkey = new Passkey({
      object: 'passkey',
      id: 'passkey_456',
      name: 'iPhone Face ID',
      credential_id: 'cred_xyz789abc012',
      verification: {
        object: 'verification',
        id: 'verification_456',
        status: 'unverified',
        strategy: 'passkey',
        attempts: 0,
        expire_at: 1735689800000,
        verified_at_client: null,
        error: null,
      },
      last_used_at: null,
      created_at: 1735689500000,
      updated_at: 1735689500000,
    });

    if (typeof passkey.__internal_toSnapshot === 'function') {
      const snapshot = passkey.__internal_toSnapshot();
      expect(snapshot).toMatchSnapshot();
    }
  });
});
