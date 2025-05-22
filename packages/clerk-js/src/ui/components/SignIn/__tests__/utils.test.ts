import type { SignInResource } from '@clerk/types';

import type { FeedbackType, FormControlState } from '../../../utils';
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
  const noop = () => {};
  const baseFieldProps = {
    onChange: noop as any,
    onBlur: noop as any,
    onFocus: noop as any,
    feedback: '',
    feedbackType: 'info' as FeedbackType,
    setError: noop,
    setWarning: noop,
    setSuccess: noop,
    setInfo: noop,
    clearFeedback: noop,
    type: 'text',
    label: '',
    placeholder: '',
    isRequired: false,
    setHasPassedComplexity: noop,
    hasPassedComplexity: false,
    isFocused: false,
    checked: false,
  };

  const mockFields: FormControlState<string>[] = [
    {
      id: 'identifier',
      name: 'identifier',
      value: '+14155552671',
      clearFeedback: noop,
      setValue: noop,
      onChange: noop as any,
      setError: noop,
      onBlur: noop as any,
      onFocus: noop as any,
      feedback: '',
      feedbackType: 'info' as FeedbackType,
      setWarning: noop,
      setSuccess: noop,
      setInfo: noop,
      setHasPassedComplexity: noop,
      hasPassedComplexity: false,
      isFocused: false,
      checked: false,
      setChecked: noop,
      props: {
        id: 'identifier',
        name: 'identifier',
        value: '+14155552671',
        ...baseFieldProps,
      },
      type: 'text',
      label: '',
      placeholder: '',
      isRequired: false,
    },
    {
      id: 'strategy',
      name: 'strategy',
      value: 'phone_code',
      clearFeedback: noop,
      setValue: noop,
      onChange: noop as any,
      setError: noop,
      onBlur: noop as any,
      onFocus: noop as any,
      feedback: '',
      feedbackType: 'info' as FeedbackType,
      setWarning: noop,
      setSuccess: noop,
      setInfo: noop,
      setHasPassedComplexity: noop,
      hasPassedComplexity: false,
      isFocused: false,
      checked: false,
      setChecked: noop,
      props: {
        id: 'strategy',
        name: 'strategy',
        value: 'phone_code',
        ...baseFieldProps,
      },
      type: 'text',
      label: '',
      placeholder: '',
      isRequired: false,
    },
  ];

  it('returns null when preferredChannels is null', () => {
    const result = getPreferredAlternativePhoneChannel(mockFields, null, 'identifier');
    expect(result).toBeNull();
  });

  it('returns null when strategy is not phone_code', () => {
    const fieldsWithDifferentStrategy = [...mockFields.slice(0, 1), { ...mockFields[1], value: 'email_code' }];
    const result = getPreferredAlternativePhoneChannel(fieldsWithDifferentStrategy, { US: 'whatsapp' }, 'identifier');
    expect(result).toBeNull();
  });

  it('returns null when phone number is not provided', () => {
    const fieldsWithoutPhone = [{ ...mockFields[0], value: '' }, mockFields[1]];
    const result = getPreferredAlternativePhoneChannel(fieldsWithoutPhone, { US: 'whatsapp' }, 'identifier');
    expect(result).toBeNull();
  });

  it('returns null when phone number does not start with +', () => {
    const fieldsWithInvalidPhone = [{ ...mockFields[0], value: '14155552671' }, mockFields[1]];
    const result = getPreferredAlternativePhoneChannel(fieldsWithInvalidPhone, { US: 'whatsapp' }, 'identifier');
    expect(result).toBeNull();
  });

  it('returns null when preferred channel is sms', () => {
    const result = getPreferredAlternativePhoneChannel(mockFields, { US: 'sms' }, 'identifier');
    expect(result).toBeNull();
  });

  it('returns whatsapp when US number and whatsapp is preferred', () => {
    const result = getPreferredAlternativePhoneChannel(mockFields, { US: 'whatsapp' }, 'identifier');
    expect(result).toBe('whatsapp');
  });

  it('handles different phone number field names', () => {
    const fieldsWithPhoneNumber = [
      {
        ...mockFields[0],
        id: 'phoneNumber',
        name: 'phoneNumber',
      },
      mockFields[1],
    ];
    const result = getPreferredAlternativePhoneChannel(fieldsWithPhoneNumber, { US: 'whatsapp' }, 'phoneNumber');
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
      '+14155552671',
    );
    expect(result).toBeNull();
  });

  it('returns null when identifierValue does not start with +', () => {
    const result = getPreferredAlternativePhoneChannelForCombinedFlow({ US: 'whatsapp' }, 'phoneNumber', '14155552671');
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

  it('returns null when identifierValue is empty', () => {
    const result = getPreferredAlternativePhoneChannelForCombinedFlow({ US: 'whatsapp' }, 'phoneNumber', '');
    expect(result).toBeNull();
  });

  it('returns null when identifierValue is missing', () => {
    const result = getPreferredAlternativePhoneChannelForCombinedFlow({ US: 'whatsapp' }, 'phoneNumber', '');
    expect(result).toBeNull();
  });
});
