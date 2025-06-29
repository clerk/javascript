import { describe, expect, it } from 'vitest';

import { EmailAddress } from '../EmailAddress';

describe('EmailAddress', () => {
  it('has the same initial properties', () => {
    const emailAddress = new EmailAddress({
      object: 'email_address',
      id: 'email_123',
      email_address: 'test@example.com',
      verification: {
        object: 'verification',
        id: 'verification_123',
        status: 'verified',
        strategy: 'email_code',
        attempts: 1,
        expire_at: 1735689700000,
        verified_at_client: null,
        error: null,
      },
      linked_to: [],
      created_at: 1735689600000,
      updated_at: 1735689650000,
    });

    expect(emailAddress).toMatchObject({
      id: 'email_123',
      emailAddress: 'test@example.com',
      verification: expect.any(Object),
      linkedTo: [],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

describe('EmailAddress Snapshots', () => {
  it('should match snapshot for email address structure', () => {
    const emailAddress = new EmailAddress({
      object: 'email_address',
      id: 'email_123',
      email_address: 'user@example.com',
      verification: {
        object: 'verification',
        id: 'verification_123',
        status: 'verified',
        strategy: 'email_code',
        attempts: 1,
        expire_at: 1735689700000,
        verified_at_client: null,
        error: null,
      },
      linked_to: [],
      created_at: 1735689600000,
      updated_at: 1735689650000,
    });

    const snapshot = {
      id: emailAddress.id,
      emailAddress: emailAddress.emailAddress,
      verification: {
        id: emailAddress.verification?.id,
        status: emailAddress.verification?.status,
        strategy: emailAddress.verification?.strategy,
      },
      linkedTo: emailAddress.linkedTo,
      createdAt: emailAddress.createdAt?.getTime(),
      updatedAt: emailAddress.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    const emailAddress = new EmailAddress({
      object: 'email_address',
      id: 'email_456',
      email_address: 'snapshot@test.com',
      verification: {
        object: 'verification',
        id: 'verification_456',
        status: 'unverified',
        strategy: 'email_link',
        attempts: 0,
        expire_at: 1735689800000,
        verified_at_client: null,
        error: null,
      },
      linked_to: ['user_123'],
      created_at: 1735689600000,
      updated_at: 1735689650000,
    });

    if (typeof emailAddress.__internal_toSnapshot === 'function') {
      const snapshot = emailAddress.__internal_toSnapshot();
      expect(snapshot).toMatchSnapshot();
    }
  });
});
