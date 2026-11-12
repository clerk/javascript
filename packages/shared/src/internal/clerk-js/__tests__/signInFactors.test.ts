import { describe, expect, it } from 'vitest';

import type { SignInFactor } from '@/types';

import { determineStartingSignInFactor } from '../signInFactors';

describe('determineStartingSignInFactor', () => {
  describe('with password as the preferred sign in strategy', () => {
    it('selects password if available', () => {
      const factors: SignInFactor[] = [{ strategy: 'password' }];
      expect(determineStartingSignInFactor(factors, null, 'password', false)).toEqual({ strategy: 'password' });
    });

    it('selects based on user input in the previous step if password is not available', () => {
      const factors: SignInFactor[] = [
        { strategy: 'email_code', emailAddressId: 'idn_1', safeIdentifier: 'ccoe@example.com' },
        { strategy: 'phone_code', phoneNumberId: 'idn_2', safeIdentifier: 'jdoe@example.com' },
      ];
      expect(determineStartingSignInFactor(factors, 'jdoe@example.com', 'password', false)).toEqual({
        strategy: 'phone_code',
        phoneNumberId: 'idn_2',
        safeIdentifier: 'jdoe@example.com',
      });
    });

    it('selects by prioritizing email_code if all the above fail', () => {
      const factors: SignInFactor[] = [
        { strategy: 'phone_code', phoneNumberId: 'idn_2', safeIdentifier: 'jdoe@example.com' },
        { strategy: 'email_code', emailAddressId: 'idn_1', safeIdentifier: 'ccoe@example.com' },
      ];
      expect(determineStartingSignInFactor(factors, null, 'password', false)).toEqual({
        strategy: 'email_code',
        emailAddressId: 'idn_1',
        safeIdentifier: 'ccoe@example.com',
      });
    });

    it('selects phone_code if all the above fail', () => {
      const factors: SignInFactor[] = [
        { strategy: 'phone_code', phoneNumberId: 'idn_2', safeIdentifier: 'jdoe@example.com' },
      ];
      expect(determineStartingSignInFactor(factors, null, 'password', false)).toEqual({
        strategy: 'phone_code',
        phoneNumberId: 'idn_2',
        safeIdentifier: 'jdoe@example.com',
      });
    });

    it('returns null if every other scenario', () => {
      expect(determineStartingSignInFactor([], null, 'password', false)).toBeNull();
    });
  });

  describe('with OTP as the preferred sign in strategy', () => {
    it('selects based on user input in the previous step', () => {
      const factors: SignInFactor[] = [
        { strategy: 'password' },
        { strategy: 'email_code', emailAddressId: 'idn_1', safeIdentifier: 'ccoe@example.com' },
        { strategy: 'phone_code', phoneNumberId: 'idn_2', safeIdentifier: 'jdoe@example.com' },
      ];
      expect(determineStartingSignInFactor(factors, 'jdoe@example.com', 'otp', false)).toEqual({
        strategy: 'phone_code',
        phoneNumberId: 'idn_2',
        safeIdentifier: 'jdoe@example.com',
      });
    });

    it('selects by prioritizing email_code if the above fails', () => {
      const factors: SignInFactor[] = [
        { strategy: 'password' },
        { strategy: 'phone_code', phoneNumberId: 'idn_2', safeIdentifier: 'jdoe@example.com' },
        { strategy: 'email_code', emailAddressId: 'idn_1', safeIdentifier: 'ccoe@example.com' },
      ];
      expect(determineStartingSignInFactor(factors, null, 'otp', false)).toEqual({
        strategy: 'email_code',
        emailAddressId: 'idn_1',
        safeIdentifier: 'ccoe@example.com',
      });
    });

    it('selects phone_code if all the above fail', () => {
      const factors: SignInFactor[] = [
        { strategy: 'password' },
        { strategy: 'phone_code', phoneNumberId: 'idn_2', safeIdentifier: 'jdoe@example.com' },
      ];
      expect(determineStartingSignInFactor(factors, null, 'otp', false)).toEqual({
        strategy: 'phone_code',
        phoneNumberId: 'idn_2',
        safeIdentifier: 'jdoe@example.com',
      });
    });

    it('selects password as a last resort if available', () => {
      const factors: SignInFactor[] = [{ strategy: 'password' }];
      expect(determineStartingSignInFactor(factors, null, 'otp', false)).toEqual({ strategy: 'password' });
    });

    it('returns null if every other scenario', () => {
      expect(determineStartingSignInFactor([], null, 'otp', false)).toBeNull();
    });
  });
});
