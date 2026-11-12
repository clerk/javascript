import type { SignInFactor, SignInResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import type { FormControlState } from '@/ui/utils/useFormControl';

import {
  determineSalutation,
  determineStartingSignInSecondFactor,
  getPreferredAlternativePhoneChannel,
  getPreferredAlternativePhoneChannelForCombinedFlow,
  isOfferableSecondFactor,
} from '../utils';

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

describe('determineStartingSignInSecondFactor', () => {
  const secondFactors = [{ strategy: 'totp' }, { strategy: 'passkey' }] as SignInFactor[];

  it('prefers passkey when WebAuthn is supported', () => {
    expect(determineStartingSignInSecondFactor(secondFactors, true)).toEqual({ strategy: 'passkey' });
  });

  it('falls back to the next factor when WebAuthn is not supported', () => {
    expect(determineStartingSignInSecondFactor(secondFactors, false)).toEqual({ strategy: 'totp' });
  });

  it('falls back to the passkey when it is the only factor, even without WebAuthn support', () => {
    expect(determineStartingSignInSecondFactor([{ strategy: 'passkey' }] as SignInFactor[], false)).toEqual({
      strategy: 'passkey',
    });
  });
});

describe('isOfferableSecondFactor', () => {
  it('offers passkey only when WebAuthn is supported', () => {
    expect(isOfferableSecondFactor({ strategy: 'passkey' }, true)).toBe(true);
    expect(isOfferableSecondFactor({ strategy: 'passkey' }, false)).toBe(false);
    expect(isOfferableSecondFactor({ strategy: 'totp' }, false)).toBe(true);
  });
});
