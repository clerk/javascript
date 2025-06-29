import { describe, expect, it } from 'vitest';

import { PhoneNumber } from '../PhoneNumber';

describe('PhoneNumber', () => {
  it('has the same initial properties', () => {
    const phoneNumber = new PhoneNumber({
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
        error: null,
      },
      linked_to: [],
      backup_codes: [],
      created_at: 1735689600000,
      updated_at: 1735689650000,
    });

    expect(phoneNumber).toMatchObject({
      id: 'phone_123',
      phoneNumber: '+1234567890',
      reservedForSecondFactor: false,
      defaultSecondFactor: false,
      reserved: false,
      verification: expect.any(Object),
      linkedTo: [],
      backupCodes: [],
    });
  });
});

describe('PhoneNumber Snapshots', () => {
  it('should match snapshot for phone number structure', () => {
    const phoneNumber = new PhoneNumber({
      object: 'phone_number',
      id: 'phone_123',
      phone_number: '+1234567890',
      reserved_for_second_factor: true,
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
        error: null,
      },
      linked_to: [],
      backup_codes: [],
      created_at: 1735689600000,
      updated_at: 1735689650000,
    });

    const snapshot = {
      id: phoneNumber.id,
      phoneNumber: phoneNumber.phoneNumber,
      reservedForSecondFactor: phoneNumber.reservedForSecondFactor,
      defaultSecondFactor: phoneNumber.defaultSecondFactor,
      reserved: phoneNumber.reserved,
      verification: {
        id: phoneNumber.verification?.id,
        status: phoneNumber.verification?.status,
        strategy: phoneNumber.verification?.strategy,
      },
      linkedTo: phoneNumber.linkedTo,
      backupCodes: phoneNumber.backupCodes,
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    const phoneNumber = new PhoneNumber({
      object: 'phone_number',
      id: 'phone_456',
      phone_number: '+9876543210',
      reserved_for_second_factor: false,
      default_second_factor: true,
      reserved: true,
      verification: {
        object: 'verification',
        id: 'verification_456',
        status: 'unverified',
        strategy: 'phone_code',
        attempts: 0,
        expire_at: 1735689800000,
        verified_at_client: null,
        error: null,
      },
      linked_to: ['user_456'],
      backup_codes: ['backup_123'],
      created_at: 1735689600000,
      updated_at: 1735689650000,
    });

    if (typeof phoneNumber.__internal_toSnapshot === 'function') {
      const snapshot = phoneNumber.__internal_toSnapshot();
      expect(snapshot).toMatchSnapshot();
    }
  });
});
