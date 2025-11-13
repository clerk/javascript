import type { VerificationJSON } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { EmailAddress, PhoneNumber } from '../../../../core/resources';
import { sortIdentificationBasedOnVerification } from '../utils';

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
          new EmailAddress(
            {
              id: '1',
              email_address: 'test@clerk.com',
              verification: {
                strategy: 'email_code',
                status: 'unverified',
                attempts: 0,
                expire_at: 200,
              } as VerificationJSON,
            },
            '',
          ),
          new EmailAddress(
            {
              id: '2',
              email_address: 'test@clerk.com',
              verification: {
                strategy: 'email_code',
                status: 'verified',
                attempts: 0,
                expire_at: 0,
              } as VerificationJSON,
            },
            '',
          ),
          new EmailAddress(
            {
              id: '3',
              email_address: 'test@clerk.com',
              verification: {
                strategy: 'email_code',
                status: 'verified',
                attempts: 0,
                expire_at: 0,
              } as VerificationJSON,
            },
            '',
          ),
          new EmailAddress(
            {
              id: '4',
              email_address: 'test@clerk.com',
              verification: {
                strategy: 'email_code',
                status: 'verified',
                attempts: 0,
                expire_at: 0,
              } as VerificationJSON,
            },
            '',
          ),
          new EmailAddress(
            {
              id: '5',
              email_address: 'test@clerk.com',
              verification: {
                strategy: 'email_code',
                status: 'unverified',
                attempts: 0,
                expire_at: 100,
              } as VerificationJSON,
            },
            '',
          ),
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
          new PhoneNumber(
            {
              id: '1',
              phone_number: '+1234567890',
              verification: {
                strategy: 'sms',
                status: 'unverified',
                attempts: 0,
                expire_at: 200,
              } as VerificationJSON,
            },
            '',
          ),
          new PhoneNumber(
            {
              id: '2',
              phone_number: '+1234567890',
              verification: {
                strategy: 'sms',
                status: 'verified',
                attempts: 0,
                expire_at: 0,
              } as VerificationJSON,
            },
            '',
          ),
          new PhoneNumber(
            {
              id: '3',
              phone_number: '+1234567890',
              verification: {
                strategy: 'sms',
                status: 'verified',
                attempts: 0,
                expire_at: 0,
              } as VerificationJSON,
            },
            '',
          ),
          new PhoneNumber(
            {
              id: '4',
              phone_number: '+1234567890',
              verification: {
                strategy: 'sms',
                status: 'verified',
                attempts: 0,
                expire_at: 0,
              } as VerificationJSON,
            },
            '',
          ),
          new PhoneNumber(
            {
              id: '5',
              phone_number: '+1234567890',
              verification: {
                strategy: 'sms',
                status: 'unverified',
                attempts: 0,
                expire_at: 100,
              } as VerificationJSON,
            },
            '',
          ),
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
        new PhoneNumber(
          {
            id: '1',
            phone_number: '+1234567890',
            verification: {
              strategy: 'sms',
              status: 'unverified',
              attempts: 0,
              expire_at: 200,
            } as VerificationJSON,
          },
          '',
        ),
        new PhoneNumber(
          {
            id: '2',
            phone_number: '+1234567890',
            verification: {
              strategy: 'sms',
              status: 'verified',
              attempts: 0,
              expire_at: 0,
            } as VerificationJSON,
          },
          '',
        ),
        new PhoneNumber(
          {
            id: '3',
            phone_number: '+1234567890',
            verification: {
              strategy: 'sms',
              status: 'verified',
              attempts: 0,
              expire_at: 0,
            } as VerificationJSON,
          },
          '',
        ),
        new PhoneNumber(
          {
            id: '4',
            phone_number: '+1234567890',
            verification: {
              strategy: 'sms',
              status: 'verified',
              attempts: 0,
              expire_at: 0,
            } as VerificationJSON,
          },
          '',
        ),
        new PhoneNumber(
          {
            id: '5',
            phone_number: '+1234567890',
            verification: {
              strategy: 'sms',
              status: 'unverified',
              attempts: 0,
              expire_at: 100,
            } as VerificationJSON,
          },
          '',
        ),
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
        new PhoneNumber(
          {
            id: '1',
            phone_number: '+1234567890',
            verification: {
              strategy: 'sms',
              status: 'unverified',
              attempts: 0,
              expire_at: 200,
            } as VerificationJSON,
          },
          '',
        ),
        new PhoneNumber(
          {
            id: '2',
            phone_number: '+1234567890',
            verification: {
              strategy: 'sms',
              status: 'verified',
              attempts: 0,
              expire_at: 0,
            } as VerificationJSON,
          },
          '',
        ),
        new PhoneNumber(
          {
            id: '3',
            phone_number: '+1234567890',
            verification: {
              strategy: 'sms',
              status: 'verified',
              attempts: 0,
              expire_at: 0,
            } as VerificationJSON,
          },
          '',
        ),
        new PhoneNumber(
          {
            id: '4',
            phone_number: '+1234567890',
            verification: {
              strategy: 'sms',
              status: 'verified',
              attempts: 0,
              expire_at: 0,
            } as VerificationJSON,
          },
          '',
        ),
        new PhoneNumber(
          {
            id: '5',
            phone_number: '+1234567890',
            verification: {
              strategy: 'sms',
              status: 'unverified',
              attempts: 0,
              expire_at: 100,
            } as VerificationJSON,
          },
          '',
        ),
        new PhoneNumber(
          {
            id: '6',
            phone_number: '+1234567890',
            verification: {
              strategy: '',
              status: '' as any,
              attempts: 0,
              expire_at: 0,
            } as VerificationJSON,
          },
          '',
        ),
      ];

      const result = sortIdentificationBasedOnVerification(input, '3');
      expect(result[5].id).toEqual('6');
    });
  });
});
