import type { EmailAddressResource, PhoneNumberResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { sortIdentificationBasedOnVerification } from '../utils';

const email = (id: string, status: string, expireAtMs = 0) =>
  ({
    id,
    verification: { status, expireAt: new Date(expireAtMs) },
  }) as EmailAddressResource;

const phone = (id: string, status: string, expireAtMs = 0) =>
  ({
    id,
    verification: { status, expireAt: new Date(expireAtMs) },
  }) as PhoneNumberResource;

describe('UserProfile utils', () => {
  describe('sortIdentificationBasedOnVerification', () => {
    it('should return an empty array if the input is null or undefined', () => {
      const result = sortIdentificationBasedOnVerification(null, null);
      expect(result).toEqual([]);
    });

    it('should return an empty array if the input is an empty array', () => {
      const result = sortIdentificationBasedOnVerification([], null);
      expect(result).toEqual([]);
    });

    it(
      `should sort the email addresses in the following order: ` +
        `1) primary, 2) verified (sorted alphabetically by id), 3) unverified (sorted by expiresAt verification property)`,
      () => {
        const input = [
          email('1', 'unverified', 200),
          email('2', 'verified'),
          email('3', 'verified'),
          email('4', 'verified'),
          email('5', 'unverified', 100),
        ];
        const result = sortIdentificationBasedOnVerification(input, '3');
        expect(result[0].id).toEqual('3');
        expect(result[1].id).toEqual('2');
        expect(result[2].id).toEqual('4');
        expect(result[3].id).toEqual('5');
        expect(result[4].id).toEqual('1');
      },
    );

    it(
      `should sort the phone numbers in the following order: ` +
        `1) primary, 2) verified (sorted alphabetically by id), 3) unverified (sorted by expiresAt verification property)`,
      () => {
        const input = [
          phone('1', 'unverified', 200),
          phone('2', 'verified'),
          phone('3', 'verified'),
          phone('4', 'verified'),
          phone('5', 'unverified', 100),
        ];

        const result = sortIdentificationBasedOnVerification(input, '3');
        expect(result[0].id).toEqual('3');
        expect(result[1].id).toEqual('2');
        expect(result[2].id).toEqual('4');
        expect(result[3].id).toEqual('5');
        expect(result[4].id).toEqual('1');
      },
    );

    it('should return the correct order if the primaryId is not in the array', () => {
      const input = [
        phone('1', 'unverified', 200),
        phone('2', 'verified'),
        phone('3', 'verified'),
        phone('4', 'verified'),
        phone('5', 'unverified', 100),
      ];

      const result = sortIdentificationBasedOnVerification(input, '10');
      expect(result[0].id).toEqual('2');
      expect(result[1].id).toEqual('3');
      expect(result[2].id).toEqual('4');
      expect(result[3].id).toEqual('5');
      expect(result[4].id).toEqual('1');
    });

    it('should return last the item without verification status', () => {
      const input = [
        phone('1', 'unverified', 200),
        phone('2', 'verified'),
        phone('3', 'verified'),
        phone('4', 'verified'),
        phone('5', 'unverified', 100),
        phone('6', ''),
      ];

      const result = sortIdentificationBasedOnVerification(input, '3');
      expect(result[5].id).toEqual('6');
    });
  });
});
