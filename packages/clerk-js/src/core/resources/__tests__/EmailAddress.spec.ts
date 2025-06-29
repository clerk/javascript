import { describe, expect, it, vi } from 'vitest';

import { EmailAddress } from '../EmailAddress';

const FIXED_DATE = new Date('2025-01-01T00:00:00.000Z');

describe('EmailAddress', () => {
  it('has the same initial properties', () => {
    const emailAddress = new EmailAddress(
      {
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
          error: null as any,
        },
        linked_to: [],
        created_at: 1735689600000,
        updated_at: 1735689650000,
      },
      '/me/email_addresses',
    );

    expect(emailAddress).toMatchObject({
      id: 'email_123',
      emailAddress: 'test@example.com',
      verification: expect.objectContaining({
        status: 'verified',
        strategy: 'email_code',
      }),
      linkedTo: [],
    });
  });
});

describe('EmailAddress Snapshots', () => {
  it('should match snapshot for email address structure', () => {
    const emailAddress = new EmailAddress(
      {
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
          error: null as any,
        },
        linked_to: [],
        created_at: 1735689600000,
        updated_at: 1735689650000,
      },
      '/me/email_addresses',
    );

    const snapshot = {
      id: emailAddress.id,
      emailAddress: emailAddress.emailAddress,
      linkedTo: emailAddress.linkedTo,
      verification: emailAddress.verification,
      matchesSsoConnection: emailAddress.matchesSsoConnection,
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);

    const emailAddress = new EmailAddress(
      {
        object: 'email_address',
        id: 'email_456',
        email_address: 'user@example.com',
        verification: {
          object: 'verification',
          id: '',
          status: 'unverified',
          strategy: 'email_code',
          attempts: 0,
          expire_at: 1735689800000,
          verified_at_client: null,
          error: {
            code: '',
            long_message: '',
            message: '',
            meta: {
              param_name: undefined,
              session_id: undefined,
              zxcvbn: undefined,
              plan: undefined,
            },
          },
          external_verification_redirect_url: null,
          message: null,
          nonce: null,
        },
        linked_to: [],
        matches_sso_connection: true,
      } as any,
      '/me/email_addresses',
    );

    expect(emailAddress.__internal_toSnapshot()).toMatchSnapshot();

    vi.useRealTimers();
  });
});
