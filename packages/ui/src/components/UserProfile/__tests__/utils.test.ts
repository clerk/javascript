import type { VerificationResource } from '@clerk/shared/types';
import { sortIdentificationBasedOnVerification } from '@clerk/shared/utils';
import { describe, expect, it } from 'vitest';

const identification = (id: string, status: VerificationResource['status'], expireAtMs = 0) => ({
  id,
  verification: { status, expireAt: new Date(expireAtMs) },
});

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
          identification('1', 'unverified', 200),
          identification('2', 'verified'),
          identification('3', 'verified'),
          identification('4', 'verified'),
          identification('5', 'unverified', 100),
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
          identification('1', 'unverified', 200),
          identification('2', 'verified'),
          identification('3', 'verified'),
          identification('4', 'verified'),
          identification('5', 'unverified', 100),
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
        identification('1', 'unverified', 200),
        identification('2', 'verified'),
        identification('3', 'verified'),
        identification('4', 'verified'),
        identification('5', 'unverified', 100),
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
        identification('1', 'unverified', 200),
        identification('2', 'verified'),
        identification('3', 'verified'),
        identification('4', 'verified'),
        identification('5', 'unverified', 100),
        identification('6', null),
      ];

      const result = sortIdentificationBasedOnVerification(input, '3');
      expect(result[5].id).toEqual('6');
    });
  });
});
