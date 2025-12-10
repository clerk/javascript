import type { SignInResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import type { FormControlState } from '@/ui/utils/useFormControl';

import {
  determineSalutation,
  determineStartingSignInFactor,
  getPreferredAlternativePhoneChannel,
  getPreferredAlternativePhoneChannelForCombinedFlow,
} from '../utils';

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

describe('getPreferredAlternativePhoneChannel', () => {
  it('returns null when preferredChannels is null', () => {
    const fields = [
      { id: 'identifier', value: '+14155552671' } as FormControlState<string>,
      { id: 'strategy', value: 'phone_code' } as FormControlState<string>,
    ];
    const result = getPreferredAlternativePhoneChannel(fields, null, 'identifier');
    expect(result).toBeNull();
  });

  it('returns null when strategy is not phone_code', () => {
    const fields = [
      { id: 'identifier', value: 'example@example.com' } as FormControlState<string>,
      { id: 'strategy', value: 'email_code' } as FormControlState<string>,
    ];
    const result = getPreferredAlternativePhoneChannel(fields, { US: 'whatsapp' }, 'identifier');
    expect(result).toBeNull();
  });

  it('returns null when identifier is not a phone number', () => {
    const fields = [{ id: 'identifier', value: 'test@example.com' } as FormControlState<string>];
    const result = getPreferredAlternativePhoneChannel(fields, { US: 'whatsapp' }, 'identifier');
    expect(result).toBeNull();
  });

  it('returns the preferred value when identifier is a phone number', () => {
    const fields = [{ id: 'identifier', value: '+14155552671' } as FormControlState<string>];
    const result = getPreferredAlternativePhoneChannel(fields, { US: 'whatsapp' }, 'identifier');
    expect(result).toBe('whatsapp');
  });

  it('returns null when preferred channel is sms', () => {
    const fields = [
      { id: 'identifier', value: '+14155552671' } as FormControlState<string>,
      { id: 'strategy', value: 'phone_code' } as FormControlState<string>,
    ];
    const result = getPreferredAlternativePhoneChannel(fields, { US: 'sms' }, 'identifier');
    expect(result).toBeNull();
  });

  it('returns whatsapp when US number and whatsapp is preferred', () => {
    const fields = [
      { id: 'identifier', value: '+14155552671' } as FormControlState<string>,
      { id: 'strategy', value: 'phone_code' } as FormControlState<string>,
    ];
    const result = getPreferredAlternativePhoneChannel(fields, { US: 'whatsapp' }, 'identifier');
    expect(result).toBe('whatsapp');
  });

  it('handles when the phone number field name is explicitly set to phoneNumber', () => {
    const fields = [
      { id: 'phoneNumber', value: '+14155552671' } as FormControlState<string>,
      { id: 'strategy', value: 'phone_code' } as FormControlState<string>,
    ];
    const result = getPreferredAlternativePhoneChannel(fields, { US: 'whatsapp' }, 'phoneNumber');
    expect(result).toBe('whatsapp');
  });
});

describe('getPreferredAlternativePhoneChannelForCombinedFlow', () => {
  it('returns null when preferredChannels is null', () => {
    const result = getPreferredAlternativePhoneChannelForCombinedFlow(null, 'phoneNumber', '+14155552671');
    expect(result).toBeNull();
  });

  it('returns null when identifierAttribute is not phoneNumber', () => {
    const result = getPreferredAlternativePhoneChannelForCombinedFlow(
      { US: 'whatsapp' },
      'emailAddress',
      'example@example.com',
    );
    expect(result).toBeNull();
  });

  it('returns null when preferred channel is sms', () => {
    const result = getPreferredAlternativePhoneChannelForCombinedFlow({ US: 'sms' }, 'phoneNumber', '+14155552671');
    expect(result).toBeNull();
  });

  it('returns whatsapp when US number and whatsapp is preferred', () => {
    const result = getPreferredAlternativePhoneChannelForCombinedFlow(
      { US: 'whatsapp' },
      'phoneNumber',
      '+14155552671',
    );
    expect(result).toBe('whatsapp');
  });

  it('returns whatsapp for different country codes', () => {
    const result = getPreferredAlternativePhoneChannelForCombinedFlow(
      { GB: 'whatsapp' },
      'phoneNumber',
      '+447911123456',
    );
    expect(result).toBe('whatsapp');
  });

  it('returns null when country code does not match preferred channels', () => {
    const result = getPreferredAlternativePhoneChannelForCombinedFlow(
      { US: 'whatsapp' },
      'phoneNumber',
      '+447911123456',
    );
    expect(result).toBeNull();
  });
});
