import { describe, expect, it, vi } from 'vitest';

import { PhoneNumber } from '../PhoneNumber';

const FIXED_DATE = new Date('2025-01-01T00:00:00.000Z');

describe('PhoneNumber', () => {
  it('has the same initial properties', () => {
    const phoneNumber = new PhoneNumber(
      {
        object: 'phone_number',
        id: 'phone_123',
        phone_number: '+1234567890',
        reserved_for_second_factor: false,
        default_second_factor: false,
        reserved: false,
        verification: {
          object: 'verification',
          id: 'verification_123',
          status: 'verified',
          strategy: 'phone_code',
          attempts: 1,
          expire_at: 1735689700000,
          verified_at_client: null,
          error: null as any,
        },
        linked_to: [],
        backup_codes: [],
        created_at: 1735689600000,
        updated_at: 1735689650000,
      } as any,
      '/me/phone_numbers',
    );

    expect(phoneNumber).toMatchObject({
      id: 'phone_123',
      phoneNumber: '+1234567890',
      reservedForSecondFactor: false,
      defaultSecondFactor: false,
      verification: expect.objectContaining({
        status: 'verified',
        strategy: 'phone_code',
      }),
      linkedTo: [],
      backupCodes: [],
    });
  });
});

describe('PhoneNumber Snapshots', () => {
  it('should match snapshot for phone number structure', () => {
    const phoneNumber = new PhoneNumber(
      {
        object: 'phone_number',
        id: 'phone_123',
        phone_number: '+1234567890',
        reserved_for_second_factor: false,
        default_second_factor: false,
        reserved: false,
        verification: {
          object: 'verification',
          id: 'verification_123',
          status: 'verified',
          strategy: 'phone_code',
          attempts: 1,
          expire_at: 1735689700000,
          verified_at_client: null,
          error: null as any,
        },
        linked_to: [],
        backup_codes: [],
        created_at: 1735689600000,
        updated_at: 1735689650000,
      } as any,
      '/me/phone_numbers',
    );

    expect(phoneNumber).toMatchSnapshot();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);

    const phoneNumber = new PhoneNumber(
      {
        object: 'phone_number',
        id: 'phone_456',
        phone_number: '+9876543210',
        reserved_for_second_factor: true,
        default_second_factor: true,
        verification: {
          object: 'verification',
          id: '',
          status: 'unverified',
          strategy: 'phone_code',
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
        backup_codes: ['backup1', 'backup2'],
      } as any,
      '/me/phone_numbers',
    );

    expect(phoneNumber.__internal_toSnapshot()).toMatchSnapshot();

    vi.useRealTimers();
  });
});
