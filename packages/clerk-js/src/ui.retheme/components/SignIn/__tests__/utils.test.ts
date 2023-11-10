import type { SignInResource } from '@clerk/types';

import { determineSalutation, determineStartingSignInFactor } from '../utils';

describe('determineStrategy(signIn, displayConfig)', () => {
  describe('with password as the preferred sign in strategy', () => {
    it('selects password if available', () => {
      const signIn = {
        supportedFirstFactors: [
          {
            strategy: 'password',
          },
        ],
      } as unknown as SignInResource;
      expect(determineStartingSignInFactor(signIn.supportedFirstFactors, signIn.identifier, 'password')).toEqual({
        strategy: 'password',
      });
    });

    it('selects based on user input in the previous step if password is not available', () => {
      const signIn = {
        identifier: 'jdoe@example.com',
        supportedFirstFactors: [
          {
            strategy: 'email_code',
            safeIdentifier: 'ccoe@example.com',
          },
          {
            strategy: 'phone_code',
            safeIdentifier: 'jdoe@example.com',
          },
        ],
      } as unknown as SignInResource;
      expect(determineStartingSignInFactor(signIn.supportedFirstFactors, signIn.identifier, 'password')).toEqual({
        strategy: 'phone_code',
        safeIdentifier: 'jdoe@example.com',
      });
    });

    it('selects by prioritizing email_code if all the above fail', () => {
      const signIn = {
        identifier: undefined,
        supportedFirstFactors: [
          {
            strategy: 'phone_code',
            safeIdentifier: 'jdoe@example.com',
          },
          {
            strategy: 'email_code',
            safeIdentifier: 'ccoe@example.com',
          },
        ],
      } as unknown as SignInResource;
      expect(determineStartingSignInFactor(signIn.supportedFirstFactors, signIn.identifier, 'password')).toEqual({
        strategy: 'email_code',
        safeIdentifier: 'ccoe@example.com',
      });
    });

    it('selects phone_code if all the above fail', () => {
      const signIn = {
        identifier: undefined,
        supportedFirstFactors: [
          {
            strategy: 'phone_code',
            safeIdentifier: 'jdoe@example.com',
          },
        ],
      } as unknown as SignInResource;
      expect(determineStartingSignInFactor(signIn.supportedFirstFactors, signIn.identifier, 'password')).toEqual({
        strategy: 'phone_code',
        safeIdentifier: 'jdoe@example.com',
      });
    });

    it('returns null if every other scenario', () => {
      const signIn = {
        identifier: undefined,
        supportedFirstFactors: [],
      } as unknown as SignInResource;
      expect(determineStartingSignInFactor(signIn.supportedFirstFactors, signIn.identifier, 'password')).toBeNull();
    });
  });

  describe('with OTP as the preferred sign in strategy', () => {
    it('selects based on user input in the previous step', () => {
      const signIn = {
        identifier: 'jdoe@example.com',
        supportedFirstFactors: [
          {
            strategy: 'password',
          },
          {
            strategy: 'email_code',
            safeIdentifier: 'ccoe@example.com',
          },
          {
            strategy: 'phone_code',
            safeIdentifier: 'jdoe@example.com',
          },
        ],
      } as unknown as SignInResource;
      expect(determineStartingSignInFactor(signIn.supportedFirstFactors, signIn.identifier, 'otp')).toEqual({
        strategy: 'phone_code',
        safeIdentifier: 'jdoe@example.com',
      });
    });

    it('selects by prioritizing email_code if the above fails', () => {
      const signIn = {
        identifier: undefined,
        supportedFirstFactors: [
          {
            strategy: 'password',
          },
          {
            strategy: 'phone_code',
            safeIdentifier: 'jdoe@example.com',
          },
          {
            strategy: 'email_code',
            safeIdentifier: 'ccoe@example.com',
          },
        ],
      } as unknown as SignInResource;
      expect(determineStartingSignInFactor(signIn.supportedFirstFactors, signIn.identifier, 'otp')).toEqual({
        strategy: 'email_code',
        safeIdentifier: 'ccoe@example.com',
      });
    });

    it('selects phone_code if all the above fail', () => {
      const signIn = {
        identifier: undefined,
        supportedFirstFactors: [
          {
            strategy: 'password',
          },
          {
            strategy: 'phone_code',
            safeIdentifier: 'jdoe@example.com',
          },
        ],
      } as unknown as SignInResource;
      expect(determineStartingSignInFactor(signIn.supportedFirstFactors, signIn.identifier, 'otp')).toEqual({
        strategy: 'phone_code',
        safeIdentifier: 'jdoe@example.com',
      });
    });

    it('selects password as a last resort if available', () => {
      const signIn = {
        supportedFirstFactors: [
          {
            strategy: 'password',
          },
        ],
      } as unknown as SignInResource;
      expect(determineStartingSignInFactor(signIn.supportedFirstFactors, signIn.identifier, 'otp')).toEqual({
        strategy: 'password',
      });
    });

    it('returns null if every other scenario', () => {
      const signIn = {
        identifier: undefined,
        supportedFirstFactors: [],
      } as unknown as SignInResource;
      expect(determineStartingSignInFactor(signIn.supportedFirstFactors, signIn.identifier, 'otp')).toBeNull();
    });
  });

  describe('determineSalutation(signIn)', () => {
    it('returns firstname, then lastname or the identifier', () => {
      let signIn = {
        identifier: 'jdoe@example.com',
        userData: {
          firstName: 'Joe',
          lastName: 'Doe',
        },
      } as unknown as SignInResource;
      expect(determineSalutation(signIn)).toBe('Joe');

      signIn = {
        identifier: 'jdoe@example.com',
        userData: {
          lastName: 'Doe',
        },
      } as unknown as SignInResource;
      expect(determineSalutation(signIn)).toBe('Doe');

      signIn = {
        identifier: 'jdoe@example.com',
      } as unknown as SignInResource;
      expect(determineSalutation(signIn)).toBe('jdoe@example.com');
    });
  });
});
