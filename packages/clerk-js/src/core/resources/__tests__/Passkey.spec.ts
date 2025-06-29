import { describe, expect, it, vi } from 'vitest';

import { Passkey } from '../Passkey';

const FIXED_DATE = new Date('2025-01-01T00:00:00.000Z');

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
        error: null as any,
      },
      last_used_at: 1735689600000,
      created_at: 1735689500000,
      updated_at: 1735689650000,
    } as any);

    expect(passkey).toMatchObject({
      id: 'passkey_123',
      name: 'My Device',
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
      name: 'Test Device',
      credential_id: 'cred_abc123def456',
      verification: {
        object: 'verification',
        id: 'verification_123',
        status: 'verified',
        strategy: 'passkey',
        attempts: 1,
        expire_at: 1735689700000,
        verified_at_client: null,
        error: null as any,
      },
      last_used_at: 1735689600000,
      created_at: 1735689500000,
      updated_at: 1735689650000,
    } as any);

    const snapshot = {
      id: passkey.id,
      name: passkey.name,
      verification: passkey.verification,
      lastUsedAt: passkey.lastUsedAt,
      createdAt: passkey.createdAt,
      updatedAt: passkey.updatedAt,
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);

    const passkey = new Passkey({
      object: 'passkey',
      id: 'passkey_snapshot',
      name: 'Snapshot Device',
      credential_id: 'credential_snapshot_123',
      verification: {
        object: 'verification',
        id: 'verification_snapshot',
        status: 'verified',
        strategy: 'passkey',
        attempts: 1,
        expire_at: 1735689800000,
        verified_at_client: null,
        error: null as any,
        nonce: null,
        message: null,
      },
      last_used_at: 1735689600000,
      created_at: 1735689500000,
      updated_at: 1735689650000,
    } as any);

    expect(passkey.__internal_toSnapshot()).toMatchSnapshot();

    vi.useRealTimers();
  });
});
